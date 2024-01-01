import { Component, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { IItem, NwIconDirective } from '@modules/nw-db/nw-db.module';
import { ArtisanService } from '@modules/artisan/artisan.module';

type ControlSet = 'armor' | 'faction' | 'earring';

type Selector<TModel, TValue> = {
  name: string;
  value: (model: NonNullable<TModel>) => WritableSignal<TValue>;
  set?: ControlSet;
  item?: (model: NonNullable<TModel>) => IItem | null;
};

type SelectorType<TSelector extends Selector<any, any>> =
  ReturnType<TSelector['value']> extends WritableSignal<infer TValue> ?
  TValue : never;

class Section<TModel, TSelector extends {
  [K in keyof any]: Selector<TModel, any>;
}> {
  protected readonly bind = effect(() => {
    const model = this.model();
    if (model) {
      for (const accessor in this.controls) {
        const value = this.controls[accessor].value(model);
        const control = this.formGroup.controls[accessor];
        if (control) {
          control.setValue(value());
        }
      }
    }
  });

  readonly formGroup = new FormGroup(this.build());

  constructor(readonly name: string, readonly model: Signal<TModel>, readonly controls: TSelector) {
  }

  protected build(): {
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

  private build(): {
    [K in keyof TSection]: FormGroup<SectionFormGroup<TSection[K]>>;
  } {
    const formGroups = {} as any;
    for (const section in this.sections) {
      formGroups[section] = this.sections[section].formGroup;
    }
    return formGroups;
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
    NwIconDirective
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  readonly #artisan: ArtisanService = inject(ArtisanService);

  protected readonly settings = new Sections({
    arcana: new Section('Arcana', this.#artisan.arcana, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() }
    }),
    cooking: new Section('Cooking', this.#artisan.cooking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
      faction: { name: 'Faction', value: model => model.faction, set: 'faction', item: model => model.getFaction() },
      earring: { name: 'Earring', value: model => model.earring, set: 'earring', item: model => model.getEarring() },
    }),
    woodworking: new Section('Woodworking', this.#artisan.woodworking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
    }),
    leatherworking: new Section('Leatherworking', this.#artisan.leatherworking, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
    }),
    stonecutting: new Section('Stonecutting', this.#artisan.stonecutting, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
    }),
    smelting: new Section('Smelting', this.#artisan.smelting, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
    }),
    weaving: new Section('Weaving', this.#artisan.weaving, {
      level: { name: 'Tradeskill level', value: model => model.level },
      head: { name: 'Headwear', value: model => model.head, set: 'armor', item: model => model.getHeadwear() },
      chest: { name: 'Chestwear', value: model => model.chest, set: 'armor', item: model => model.getChestwear() },
      hands: { name: 'Gloves', value: model => model.hands, set: 'armor', item: model => model.getGlove() },
      legs: { name: 'Legwear', value: model => model.legs, set: 'armor', item: model => model.getLegwear() },
      feet: { name: 'Footwear', value: model => model.feet, set: 'armor', item: model => model.getFootwear() },
    }),
  });
  protected readonly form = this.settings.formGroups;
}