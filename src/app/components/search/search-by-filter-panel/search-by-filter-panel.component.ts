import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchFilterItemsModel } from '@models/lookup/lookup';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'search-by-filter-panel',
  templateUrl: './search-by-filter-panel.component.html',
  styleUrls: ['./search-by-filter-panel.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class SearchByFilterPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public items: Array<SearchFilterItemsModel>;
  @Input() public title: string;
  @Input() public isShowCode: boolean;
  @Input() public selectedItems: Array<SearchFilterItemsModel>;
  @Input() public isToggle: boolean;
  public isExpand: boolean;
  public searchText: string;
  @Output() public selectItems: EventEmitter<Array<SearchFilterItemsModel>> = new EventEmitter();

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.searchText = '';
    this.isExpand = false;
  }

  /**
   * @function clearSearch
   * This method is used clear search
   */
  public clearSearch() {
    this.searchText = '';
  }

  /**
   * @function onSelectItem
   * This method is used select item
   */
  public onSelectItem(item) {
    this.selectItems.emit(item);
  }

  /**
   * @function filterClassList
   * This method is used to filter by code
   */
  public filterClassList(evt) {
    const searchTerm = evt.srcElement.value;
    this.searchText = searchTerm;
  }

  /**
   * @function onClickHeader
   * Method triggers when user click the header to toggle
   */
  public onClickHeader() {
    this.isExpand = !this.isExpand;
  }

  /**
   * @function onDiagnosticToggle
   * This method is used to toggle the diagnostic assessment
   */
  public onDiagnosticToggle(item) {
    this.selectItems.emit(item);
  }
}
