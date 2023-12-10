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

import { NwDbService, NwIconDirective, ObjectRef, SearchRef } from '@modules/nw-db/nw-db.module';
import { ArtisanService, Composite, Ingredient } from '@modules/artisan/artisan.module';
import { EntityComponent } from '../entity/entity.component';
import { ComponentDirective } from './component.directive';

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

type ConnectorSide = 'source' | 'target';

interface Connectome {
  components: Record<string, ComponentDirective>;
  connectors: Ingredient[];
}

export class Connector {
  private id: string;
  private elements: SVGGeometryElement[] = [];

  constructor(
    private readonly _canvas: SVGElement,
    private readonly _source: ComponentDirective,
    private readonly _target: ComponentDirective,
    private readonly _connectors: Ingredient[]) {
    this.id = `${_source.id}=>${_target.id}`;
    this.appendElement(...this.getPathPoints(_source, _target, _connectors, 20));
  }

  private getPoint(rect: DOMRect, slot: PointSlot, index: number = 0, range: number = 1): Point {
    if (index >= range) {
      throw new RangeError(`Index should be within rage: ${index} of ${range}.`);
    }

    const offset = this._canvas.getBoundingClientRect();
    const area = .6, spacing = 20;
    let x: number, y: number;
    switch (slot) {
      case 'top':
      case 'bottom':
        const step = Math.max(rect.width * area / range, spacing);
        x = rect.left + (rect.width - (range - 1) * step) / 2 + index * step;
        break;
      case 'left': x = rect.left; break;
      case 'right': x = rect.right; break;
    }
    switch (slot) {
      case 'top': y = rect.top; break;
      case 'bottom': y = rect.bottom; break;
      case 'left':
      case 'right':
        const step = Math.max(rect.height * area / range, spacing);
        y = rect.top + (rect.height - (range - 1) * step) / 2 + index * step;
        break;
    }
    return { x: x - offset.x, y: y - offset.y };
  }

  private getSlot(source: ComponentDirective, target: ComponentDirective, connectors: Ingredient[], side: ConnectorSide): { index: number, range: number } {
    const project = (connector: Ingredient, invert: boolean) => {
      switch (side) {
        case 'source': return invert ? connector.parent : connector.entity;
        case 'target': return invert ? connector.entity : connector.parent;
      }
    }
    const request = (invert: boolean) => {
      switch (side) {
        case 'source': return (invert ? target : source).host.data!;
        case 'target': return (invert ? source : target).host.data!;
      }
    }
    const entity = request(false);
    const related = connectors.filter(x => project(x, true) === entity).map(x => project(x, false));
    const index = related.indexOf(request(true));
    return { index: index > 0 ? index : 0, range: related.length };
  }

  private getPathPoints(source: ComponentDirective, target: ComponentDirective, connectors: Ingredient[], offset: number = 0): PathPoint[] {
    const sourceRect = source.element.getBoundingClientRect();
    const targetRect = target.element.getBoundingClientRect();
    const { index: sourceIndex, range: sourceRange } = this.getSlot(source, target, connectors, 'target');
    const { index: targetIndex, range: targetRange } = this.getSlot(source, target, connectors, 'source');
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

    element.setAttribute('id', this.id);
    element.setAttribute('d', data.map(x => {
      switch (x.type) {
        case 'm':
        case 'l': return `${x.type} ${x.x} ${x.y}`;
        default: return '';
      }
    }).join(' '));

    element.setAttribute('fill', 'transparent');
    element.setAttribute('stroke', 'var(--color-connector)');
    element.setAttribute('stroke-width', '2');
    element.setAttribute('marker-start', 'url(#circle)');
    element.setAttribute('marker-end', 'url(#circle)');

    this.elements.push(element);
    this._canvas.appendChild(element);
  }

  rearrange() {
    const element = this.elements.find(x => x.id === this.id);
    if (element) {
      const data = this.getPathPoints(this._source, this._target, this._connectors, 20)
      element.setAttribute('d', data.map(x => {
        switch (x.type) {
          case 'm':
          case 'l': return `${x.type} ${x.x} ${x.y}`;
          default: return '';
        }
      }).join(' '));
    }
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
    ComponentDirective
  ],
  templateUrl: './artisan.component.html',
  styleUrls: ['./artisan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtisanComponent {
  readonly #nwDb: NwDbService = inject(NwDbService);
  readonly #connectors: Record<string, Connector> = {};

  protected readonly itemNameFn = (item: SearchRef) => item?.name;
  protected readonly searchItem = new FormControl<string | ObjectRef | null>(null);
  protected readonly searchItems = toSignal(this.searchItem.valueChanges.pipe(
    filter(term => typeof term === 'string' && term.length > 2), map(x => x as string),
    distinctUntilChanged(), debounceTime(300),
    switchMap(term => this.#nwDb.search(term).pipe(map(x => x.filter(v => v.type === 'recipe'))))
  ));

  protected readonly artisan: ArtisanService = inject(ArtisanService);
  protected readonly switch = toSignal(this.searchItem.valueChanges.pipe(
    filter(item => typeof item !== 'string' && item != null), map(x => x as SearchRef),
    distinctUntilChanged(),
    tap(entity => this.artisan.load(entity)), debounceTime(100),
    tap(() => this.searchItem.reset())
  ));

  private readonly _connectome = signal<Connectome>({ components: {}, connectors: [] });
  @ViewChildren(ComponentDirective, { emitDistinctChangesOnly: true })
  protected set components(value: QueryList<ComponentDirective>) {
    const connectome: Connectome = { components: {}, connectors: [] };
    value.forEach(component => {
      if (component.id) {
        connectome.components[component.id] = component;
        const entity = component.host.data;
        if (entity instanceof Composite) {
          for (const ingredient of entity.ingredients) {
            connectome.connectors.push(ingredient);
          }
        }
      }
    });
    this._connectome.set(connectome);
  }

  private readonly _trigger = signal<ResizeObserverEntry[]>([]);
  private readonly _tracker: ResizeObserver = new ResizeObserver(e => this._trigger.set(e));
  private readonly _layout: HTMLDivElement[] = [];
  @ViewChildren('stage', { emitDistinctChangesOnly: true })
  protected set stages(value: QueryList<ElementRef<HTMLDivElement>>) {
    while (this._layout.length > 0) {
      const element = this._layout.shift();
      if (element) {
        this._tracker.unobserve(element);
      }
    }
    value.forEach(ref => {
      const element = ref.nativeElement;
      this._tracker.observe(element);
      this._layout.push(element);
    })
  }

  protected readonly rearrange = effect(() => {
    this._trigger();
    for (const id in this.#connectors) {
      this.#connectors[id].rearrange();
    }
  });
  protected readonly connectify = effect(() => {
    for (const id in this.#connectors) {
      if (this.#connectors[id]) {
        this.#connectors[id].remove();
        delete this.#connectors[id];
      }
    }
    const { components, connectors } = this._connectome();
    for (const connector of connectors) {
      if (connector.parent.useCraft()) {
        const id = `${connector.parent.id}=>${connector.id}`;
        const source = components[connector.parent.id];
        const target = components[connector.id];
        if (source && target && !this.#connectors[id]) {
          this.#connectors[id] = new Connector(this.#canvas, source, target, connectors);
        }
      }
    }
  });

  #canvas!: SVGElement;
  @ViewChild('container')
  protected set container(value: ElementRef<HTMLDivElement>) {
    if (!this.#canvas && value) {
      const connectors: HTMLElement = value.nativeElement;
      connectors.style.position = 'relative';

      const canvas = document.createElementNS(SVG_NS, 'svg');
      canvas.style.height = '100%';
      canvas.style.width = '100%';
      canvas.style.position = 'absolute';
      canvas.style.overflow = 'visible';

      const defs = canvas.appendChild(document.createElementNS(SVG_NS, 'defs'))
      const circle = defs.appendChild(document.createElementNS(SVG_NS, 'marker'))
      circle.id = 'circle';
      circle.setAttribute('viewBox', '-2.5 -2.5 5 5');
      circle.setAttribute('markerUnits', 'strokeWidth');
      circle.setAttribute('markerWidth', '5');
      circle.setAttribute('markerHeight', '5');

      const path = circle.appendChild(document.createElementNS(SVG_NS, 'circle'))
      path.setAttribute('stroke', 'var(--color-text-primary)');
      path.setAttribute('stroke-width', '0.7');
      path.setAttribute('fill', 'var(--color-connector)');
      path.setAttribute('r', '1.5');

      this.#canvas = connectors.insertAdjacentElement('afterbegin', canvas) as SVGElement;
    }
  }
}
