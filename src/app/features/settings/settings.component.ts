import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { IItem, IconRef, NwIconDirective } from '@modules/nw-db/nw-db.module';
import { ArtisanService } from '@modules/artisan/artisan.module';
import { SortPipe } from '@app/services/sort.pipe';

type Selector<TModel, TValue> = {
  name: string;
  value: (model: NonNullable<TModel>) => WritableSignal<TValue>;
  block?: string;
  item?: (model: NonNullable<TModel>) => IItem | null;
};

type SelectorType<TSelector extends Selector<any, any>> =
  ReturnType<TSelector['value']> extends WritableSignal<infer TValue> ?
  TValue : never;

class Section<TModel, TSelector extends {
  [K in keyof any]: Selector<TModel, any>;
}> implements IconRef {
  static #id = 0;

  protected readonly bind = effect(() => {
    const model = this.model();
    if (model) {
      for (const accessor in this.controls) {
        const value = this.controls[accessor].value(model);
        const control = this.formGroup.controls[accessor];
        if (control) {
          control.setValue(value(), { emitEvent: true, emitModelToViewChange: true, emitViewToModelChange: true });
        }
      }
    }
  });

  readonly id = Section.#id++;
  readonly formGroup = new FormGroup(this.build());

  constructor(readonly name: string, readonly icon: string, readonly model: Signal<TModel>, readonly controls: TSelector) {
  }

  private build(): {
    [K in keyof TSelector]: FormControl<SelectorType<TSelector[K]>>
  } {
    const controls: {
      [K in keyof TSelector]: FormControl<SelectorType<TSelector[K]>>
    } = {} as any;
    for (const control in this.controls) {
      controls[control] = new FormControl();
    }
    return controls;
  }

  save(): void {
    const model = this.model();
    if (model) {
      for (const accessor in this.controls) {
        const value = this.controls[accessor].value(model);
        const control = this.formGroup.controls[accessor];
        if (control && control.valid && control.dirty) {
          value.set(control.value);
        }
      }
    }
  }
}

type SectionSelector<TSection extends Section<any, any>> =
  TSection extends Section<any, infer TSelector> ?
  TSelector : never;

type SectionFormGroup<TSection extends Section<any, any>> =
  TSection extends Section<any, infer TControl> ?
  {
    [K in keyof TControl]: FormControl<SelectorType<TControl[K]>>
  } : never;

class Sections<TSection extends {
  [K in keyof TSection]: Section<any, SectionSelector<TSection[K]>>;
}> {
  readonly formGroups = this.build();

  constructor(readonly sections: TSection) {
  }

  get disabled(): boolean {
    let valid = true, dirty = false;

    for (const group in this.formGroups) {
      const formGroup = this.formGroups[group];
      dirty ||= formGroup.dirty;
      valid &&= formGroup.valid;
    }

    return !dirty || !valid;
  }

  private build(): {
    [K in keyof TSection]: FormGroup<SectionFormGroup<TSection[K]>>;
  } {
    const formGroups = {} as any;
    for (const section in this.sections) {
      formGroups[section] = this.sections[section].formGroup;
    }
    return formGroups;
  }

  save(): void {
    for (const section in this.sections) {
      this.sections[section].save();
    }
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    NwIconDirective,
    SortPipe
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  readonly #artisan: ArtisanService = inject(ArtisanService);
  readonly #dialog: MatDialogRef<SettingsComponent> = inject(MatDialogRef<SettingsComponent>);

  protected readonly settings = new Sections({
    housing: new Section('Housing', 'icons/filters/itemtypes/housing', this.#artisan.housing, {
      crafting1: { name: 'Crafting', value: model => model.trophy1, block: 'house1', item: model => model.getCraftingTrophy() },
      crafting2: { name: 'Crafting', value: model => model.trophy2, block: 'house2', item: model => model.getCraftingTrophy() },
      crafting3: { name: 'Crafting', value: model => model.trophy3, block: 'house3', item: model => model.getCraftingTrophy() },
    }),
    arcana: new Section('Arcana', 'icons/filters/tradeskills/arcana', this.#artisan.arcana, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() }
    }),
    cooking: new Section('Cooking', 'icons/filters/tradeskills/cooking', this.#artisan.cooking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
      faction: { name: 'Faction', value: model => model.faction, block: 'faction', item: model => model.getFaction() },
      earring: { name: 'Earring', value: model => model.earring, block: 'jewelry', item: model => model.getEarring() },
    }),
    woodworking: new Section('Woodworking', 'icons/filters/tradeskills/woodworking', this.#artisan.woodworking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
    }),
    leatherworking: new Section('Leatherworking', 'icons/filters/tradeskills/leatherworking', this.#artisan.leatherworking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
    }),
    stonecutting: new Section('Stonecutting', 'icons/filters/tradeskills/stonecutting', this.#artisan.stonecutting, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
    }),
    smelting: new Section('Smelting', 'icons/filters/tradeskills/smelting', this.#artisan.smelting, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
    }),
    weaving: new Section('Weaving', 'icons/filters/tradeskills/weaving', this.#artisan.weaving, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, block: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, block: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, block: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, block: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, block: 'armor', item: model => model.getFootwear() },
    }),
  });
  protected readonly form = this.settings.formGroups;

  protected save(): void {
    if (!this.settings.disabled) {
      this.settings.save();
      this.#artisan.saveSettings();
      this.#dialog.close();
    }
  }

  protected cancel(): void {
    this.#dialog.close();
  }
}
