import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

import { NwDbApiService, NwIconDirective, ObjectRef, SearchRef } from '@modules/nw-db/nw-db.module';
import { ArtisanService, Composite, Ingredient } from '@modules/artisan/artisan.module';
import { EntityComponent } from '../entity/entity.component';
import { IngredientComponent } from '../ingredient/ingredient.component';
import { IngredientDirective } from './ingredient.directive';

const SVG_NS = 'http://www.w3.org/2000/svg';

type Point = {
  x: number;
  y: number;
};

type MovePoint = {
  type: 'm';
  x: number;
  y: number;
};

type LinePoint = {
  type: 'l';
  x: number;
  y: number;
}

type PathPoint = MovePoint | LinePoint;
type PointSlot = 'top' | 'left' | 'bottom' | 'right';

interface Connectome {
  elements: Record<string, HTMLElement>;
  connectors: Ingredient[];
}

export class Connector {
  private elements: SVGGeometryElement[] = [];

  constructor(private readonly _canvas: SVGElement, source: HTMLElement, target: HTMLElement, index: number = 0, range: number = 1) {
    this.appendElement(...this.getPathPoints(source, target, 20));
  }

  private getPoint(rect: DOMRect, slot: PointSlot, index: number = 0, range: number = 1): Point {
    if (index >= range) {
      throw new RangeError(`Index should be within rage: ${index} of ${range}.`);
    }

    const offset = this._canvas.getBoundingClientRect();
    const area = .6;
    let x: number, y: number;
    switch (slot) {
      case 'top':
      case 'bottom':
        const grid = rect.width * area / range;
        x = rect.left + (rect.width - (range - 1) * grid) / 2 + index * grid;
        break;
      case 'left': x = rect.left; break;
      case 'right': x = rect.right; break;
    }
    switch (slot) {
      case 'top': y = rect.top; break;
      case 'bottom': y = rect.bottom; break;
      case 'left':
      case 'right':
        const grid = rect.height * area / range;
        y = rect.top + (rect.height - (range - 1) * grid) / 2 + index * grid;
        break;
    }
    return { x: x - offset.x, y: y - offset.y };
  }

  private getSlot(element: Element): { index: number, range: number } {
    const children = element.parentElement?.children;
    let index = 0;
    for (let i = 0; i < (children?.length ?? 0); i++) {
      if (children?.item(i) === element) {
        index = i;
      }
    }
    return { index, range: children?.length ?? 1 };
  }

  private getPathPoints(source: Element, target: Element, offset: number = 0): PathPoint[] {
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const { index: sourceIndex, range: sourceRange } = this.getSlot(source);
    const { index: targetIndex, range: targetRange } = this.getSlot(target);
    const sourcePoint = this.getPoint(sourceRect, 'right', targetIndex, targetRange);
    const targetPoint = this.getPoint(targetRect, 'left', sourceIndex, sourceRange);
    let point: Point | null = null;
    if (offset > 0) {
      targetPoint.x -= 2 * offset;
      point = { x: offset, y: 0 };
    }
    const points: PathPoint[] = [{ type: 'l', x: targetPoint.x - sourcePoint.x, y: targetPoint.y - sourcePoint.y }];
    if (point) {
      points.unshift({ type: 'l', ...point });
      points.push({ type: 'l', ...point });
    }
    points.unshift({ type: 'm', ...sourcePoint });
    return points;
  }

  private appendElement(...data: PathPoint[]): void {
    const element = document.createElementNS(SVG_NS, 'path');

    element.setAttribute('d', data.map(x => {
      switch (x.type) {
        case 'm':
        case 'l': return `${x.type} ${x.x} ${x.y}`;
        default: return '';
      }
    }).join(' '));

    element.setAttribute('fill', 'transparent');
    element.setAttribute('stroke', 'gray');
    element.setAttribute('stroke-width', '2');
    element.setAttribute('marker-end', 'url(#circle)');

    this.elements.push(element);
    this._canvas.appendChild(element);
  }

  remove(): void {
    while (this.elements.length > 0) {
      this.elements.shift()?.remove();
    }
  }
}

@Component({
  selector: 'app-artisan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatProgressBarModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule, MatAutocompleteModule,
    MatIconModule,
    NwIconDirective,
    EntityComponent,
    IngredientComponent,
    IngredientDirective
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisanComponent {
  readonly #nwDbApi: NwDbApiService = inject(NwDbApiService);
  private readonly connectors: Record<string, Connector> = {};

  protected readonly itemNameFn = (item: SearchRef) => item?.name;
  protected readonly searchItem = new FormControl<string | ObjectRef | null>(null);
  protected readonly searchItems = toSignal(this.searchItem.valueChanges.pipe(
    filter(term => typeof term === 'string' && term.length > 2), map(x => x as string),
    distinctUntilChanged(), debounceTime(300),
    switchMap(term => this.#nwDbApi.search(term).pipe(map(x => x.filter(v => v.type === 'recipe'))))
  ));

  protected readonly artisan: ArtisanService = inject(ArtisanService);
  protected readonly switch = toSignal(this.searchItem.valueChanges.pipe(
    filter(item => typeof item !== 'string' && item != null), map(x => x as SearchRef),
    distinctUntilChanged(),
    tap(entity => this.artisan.load(entity)), debounceTime(100),
    tap(() => this.searchItem.reset())
  ));

  protected readonly connectome = signal<Connectome>({ elements: {}, connectors: [] });
  @ViewChildren(IngredientDirective)
  protected set components(value: QueryList<IngredientDirective>) {
    const connectome: Connectome = { elements: {}, connectors: [] };
    value.forEach(connector => {
      connectome.elements[connector.element.id] = connector.element;
      const entity = connector.host.data;
      if (entity instanceof Composite && entity.expand()) {
        for (const ingredient of entity.ingredients) {
          connectome.connectors.push(ingredient);
        }
      }
    });
    this.connectome.set(connectome);
  }

  protected readonly connectify = effect(() => {
    const { elements, connectors } = this.connectome();
    const materials = this.artisan.product()?.materials;
    for (const id in this.connectors) {
      if (this.connectors[id]) {
        this.connectors[id].remove();
        delete this.connectors[id];
      }
    }
    for (const connector of connectors) {
      const id = `${connector.parentId}=>${connector.id}`;
      const source = elements[connector.parentId];
      const target = elements[connector.id];
      if (source && target && !this.connectors[id]) {
        this.connectors[id] = new Connector(this.#canvas, source, target);
      }
    }
  });

  #canvas!: SVGElement;
  @ViewChild('container')
  protected set container(value: ElementRef<HTMLDivElement>) {
    if (!this.#canvas) {
      const connectors: HTMLElement = value.nativeElement;
      connectors.style.position = 'relative';

      const canvas = document.createElementNS(SVG_NS, 'svg');
      canvas.style.height = '100%';
      canvas.style.width = '100%';
      canvas.style.position = 'absolute';

      const defs = canvas.appendChild(document.createElementNS(SVG_NS, 'defs'))
      const circle = defs.appendChild(document.createElementNS(SVG_NS, 'marker'))
      circle.id = 'circle';
      circle.setAttribute('viewBox', '0 0 5 5');
      circle.setAttribute('markerUnits', 'strokeWidth');
      circle.setAttribute('markerWidth', '5');
      circle.setAttribute('markerHeight', '5');
      const path = circle.appendChild(document.createElementNS(SVG_NS, 'circle'))
      path.setAttribute('stroke', 'white');
      path.setAttribute('r', '3');
      path.setAttribute('cx', '0');
      path.setAttribute('cy', '0');

      this.#canvas = connectors.insertAdjacentElement('afterbegin', canvas) as SVGElement;
    }
  }
}
