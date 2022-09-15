import { DragAndDropComponent } from '@components/player/questions/drag-and-drop/drag-and-drop.component';
import { FillInTheBlanksComponent } from '@components/player/questions/fill-in-the-blanks/fill-in-the-blanks.component';
import { FreeResponseComponent } from '@components/player/questions/free-response/free-response.component';
import { HotTextHighlightComponent } from '@components/player/questions/hot-text-highlight/hot-text-highlight.component';
import { MultipleAnswerComponent } from '@components/player/questions/multiple-answer/multiple-answer.component';
import { MultipleChoiceComponent } from '@components/player/questions/multiple-choice/multiple-choice.component';
import { MultipleSelectImageComponent } from '@components/player/questions/multiple-select-image/multiple-select-image.component';
import { MultipleSelectTextComponent } from '@components/player/questions/multiple-select-text/multiple-select-text.component';
import { DecodingAssessmentComponent } from '@components/player/questions/serp/decoding-assessment/decoding-assessment.component';
import { EncodingAssessmentComponent } from '@components/player/questions/serp/encoding-assessment/encoding-assessment.component';
import { PickAndChooseComponent } from '@components/player/questions/serp/pick-and-choose/pick-and-choose.component';
import { SayOutLoudComponent } from '@components/player/questions/serp/say-out-loud/say-out-loud.component';
import { SerpMultipleChoiceComponent } from '@components/player/questions/serp/serp-multiple-choice/serp-multiple-choice.component';
import { SerpSilentReadingComponent } from '@components/player/questions/serp/serp-silent-reading/serp-silent-reading.component';
import { SortingComponent } from '@components/player/questions/serp/sorting/sorting.component';
import { UpcomingQuestionComponent } from '@components/player/questions/serp/upcoming-question/upcoming-question.component';
import { TrueOrFalseComponent } from '@components/player/questions/true-or-false/true-or-false.component';

export const QUESTIONS = [
  DragAndDropComponent,
  FillInTheBlanksComponent,
  FreeResponseComponent,
  HotTextHighlightComponent,
  MultipleSelectImageComponent,
  MultipleSelectTextComponent,
  MultipleAnswerComponent,
  MultipleChoiceComponent,
  TrueOrFalseComponent,
  SayOutLoudComponent,
  EncodingAssessmentComponent,
  DecodingAssessmentComponent,
  PickAndChooseComponent,
  SortingComponent,
  UpcomingQuestionComponent,
  SerpMultipleChoiceComponent,
  SerpSilentReadingComponent
];


export const QUESTION_TYPES = {
  multiple_choice_question: MultipleChoiceComponent,
  multiple_answer_question: MultipleAnswerComponent,
  true_false_question: TrueOrFalseComponent,
  fill_in_the_blank_question: FillInTheBlanksComponent,
  hot_text_reorder_question: DragAndDropComponent,
  hot_text_highlight_question: HotTextHighlightComponent,
  hot_spot_text_question: MultipleSelectTextComponent,
  hot_spot_image_question: MultipleSelectImageComponent,
  open_ended_question: FreeResponseComponent,
  serp_lang_say_out_loud_question: SayOutLoudComponent,
  serp_encoding_assessment_question: EncodingAssessmentComponent,
  serp_decoding_assessment_question: DecodingAssessmentComponent,
  serp_pick_n_choose_question: PickAndChooseComponent,
  serp_sorting_question: SortingComponent,
  serp_multi_choice_question : SerpMultipleChoiceComponent,
  serp_silent_reading_question: SerpSilentReadingComponent
};
