import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchFilterItemsModel } from '@models/lookup/lookup';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'search-by-filter-taxonomy-panel',
  templateUrl: './search-by-filter-taxonomy-panel.component.html',
  styleUrls: ['./search-by-filter-taxonomy-panel.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class SearchByFilterTaxonomyPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public items: Array<SearchFilterItemsModel>;
  @Input() public title: string;
  @Input() public selectedItem: SearchFilterItemsModel;
  public isExpand: boolean;
  @Output() public selectItem: EventEmitter<SearchFilterItemsModel> = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.isExpand = false;
  }

  /**
   * @function onSelectItem
   * This method is used select item
   */
  public onSelectItem(selectedItem) {
    this.selectItem.emit(selectedItem);
  }

  /**
   * @function onClickHeader
   * Method triggers when user click the header to toggle
   */
  public onClickHeader() {
    this.isExpand = !this.isExpand;
  }
}
