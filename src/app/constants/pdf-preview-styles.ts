export const STYLE = {
  pageSize: 'A4',
  pageMargin: [25, 80, 40, 60],
  headerMargin: [35, 7, 40, 0],
  headerWidth: ['50%', '50%'],
  alignmentLeft: 'left',
  alignmentCenter: 'center',
  alignmentRight: 'right',
  listTypeNone: 'none',
  layoutNoBorder: 'noBorders',
  headerLineMargin: [20, 7, 25, 0],
  defaultFontSize: 8,
  reportTableMargin: [35, 10, 35, 10],
  tableRowHeight: 25,
  headerRowOne: 1,
  headerRowTwo: 2,
  reportTableColumnWidth: ['20%', '9%', '9%', '9%', '9%', '9%', '9%', '10%', '10%', '10%'],
  pageBreakAfter: 'after',
  individualReportTableMargin: [25, 10, 25, 10],
  individualReportTableColumnWidth: ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
  chartMargin: [10, 30, 10, 10],
  domainFontSize: 7,
  domainMargin: [0, 0, 0, 5],
  competencyTableMargin: [25, 10, 25, 10],
  competencyTableWidth: ['46%', '46%'],
  reportHeaderRowSpan: 2,
  reportCompetencyColSpan: 3,
  reportTimespentColSpan: 2
};

export const ASSESTMENT_PDF_PREVIEW_STYLES = {
  answerSectionStyles: {
    display: 'grid',
    gridGap: '10px',
    width: '100%',
    margin: '10px'
  },
  multiGridImageStyles: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridGap: '10px'
  },
  multiAnswerGridImageStyles: {
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  multiImageStyles: {
    objectFit: 'contain',
    width: '100%',
    height: '150px'
  },
  titleTextSyles: {
    fontWeight: '900',
    fontSize: '18px'
  },
  pdfPaddingStyles: {
    display: 'block',
    marginBlockStart: '1em',
    marginBlockEnd: '1em',
    marginInlineStart: '0px',
    marginInlineEnd: '0px'
  },
  pdfThumbnailRowStyle: {
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pdfThumbnailImageStyle: {
    objectFit: 'contain',
    width: '100%',
    height: '150px'
  },
  pdfDecodingThumnailStyles: {
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  pdfDecodingThumbnailImageStyles: {
    objectFit: 'contain',
    width: '100%',
    height: '150px'
  },
  pdfDecodingAssesmentRowStyles: {
    width: '100%',
    alignItems: 'center',
    display: 'grid',
    textAlign: 'center',
    gridTemplateColumns: ' 50% 50%'
  },
  pdfDecodingMicRowStyles: {
    display: 'grid',
    gridTemplateColumns: '35px 120px 35px',
    justifyContent: 'center',
    margin: '25px 0',
    height: ' 100%'
  },
  pdfEncodinfAnswersStyles: {
    width: ' 100%',
    alignItems: 'center',
    display: 'grid',
    textAlign: 'center',
    margin: ' 0 5px'
  },
  pdfAssestmentHeaderStyles: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'space-between'
  },
  headerSectionStyles: {
    display: 'grid',
    gridTemplateColumns: '15% 70% 5% 10%',
    alignItems: 'center'
  },
};

export const COLLECTION_PDF_PREVIEW_STYLES = {
  resouceContentStyles: {
    width: '100%'
  },
  headerSectionStyles: {
    display: 'grid',
    gridTemplateColumns: '15% 70% 5% 10%',
    alignItems: 'center'
  },
  resourceContentGridStyles: {
    display: 'grid',
    gridTemplateColumns: ' max-content 1fr',
    width: '100%',
    gridGap: '10px',
  },
  pdfPaddingStyles: {
    display: 'block',
    marginBlockStart: '1em',
    marginBlockEnd: '1em',
    marginInlineStart: '0px',
    marginInlineEnd: '0px'
  },
  resourceImageStyles: {
    padding: '10px',
    justifyContent: 'start',
    display: 'grid'
  },
  pdfCollectionHeaderStyles: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'space-between'
  }
}

export const PDF_OPTIONS = {
  documentSize: 'A4',
  type: 'share',
}
