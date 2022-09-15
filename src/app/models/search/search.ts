import { OwnerModel } from '../signature-content/signature-content';
import { TaxonomyModel } from '../taxonomy/taxonomy';

export interface SearchCourseModel {
    searchResults: Array<SearchResultsModel>;
    totalCount: number;
}

export interface SearchResultsModel {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string,
    subject: string
    subjectName: string;
    subjectSequence: number;
    isVisibleOnProfile: boolean;
    isPublished: boolean;
    unitCount: number;
    standards: Array<TaxonomyModel>;
    owner: OwnerModel;
    sequence: number;
    version: string;
}