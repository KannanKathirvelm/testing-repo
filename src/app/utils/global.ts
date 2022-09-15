import { CONTENT_TYPES, DEFAULT_IMAGES, DEFAULT_IMAGES_XS, RESOURCES_DEFAULT_IMAGES, SORTING_TYPES } from '@constants/helper-constants';
import * as moment from 'moment';

/**
 * @function addHttpsProtocol
 * Method used to add http protocol to url
 */
export function addHttpsProtocol(url: string, cdnUrl?: string) {
  if (url) {
    const pattern = url.match(/http/g);
    if (!pattern) {
      const cdn = new RegExp(cdnUrl, 'g');
      const cdnMatch = url.match(cdn);
      if (cdnMatch) {
        url = `https:${url}`;
      } else {
        url = cdnUrl + url;
      }
    }
  }
  return url;
}

// function to convert array to string
export function convertArrayToString(filterList, key) {
  const params = filterList.map(filter => {
    return filter[key];
  });
  return params.length > 0 ? params.join(',') : null;
}

// function to calculate getLimit
export function getLimit(containerHeight, listHeight) {
  const calculatedLimit =
    Math.round(Number(containerHeight) / Number(listHeight)) + 2;
  return calculatedLimit < 25 ? calculatedLimit : 25; // maximum api return value 25
}

// function to check url is pdf
export function checkUrlisPDF(url) {
  return url.match(/\.(pdf)/g);
}

// function to calculate max score
export function calculateAverageScore(score, maxScore) {
  return (score / maxScore) * 100;
}

// function to check the http url
export function checkHttpUrl(url: string, ) {
  const pattern = url.match(/http/g);
  return pattern;
}

/**
 * @function findPercentage
 * This method is used to get the domain coverage percentage
 */
export function findPercentage(coverage, totalCoverage) {
  let percentage = 0;
  if (totalCoverage && coverage) {
    percentage = totalCoverage && coverage ? (coverage / totalCoverage) * 100 : 0;
  }
  return percentage;
}

/**
 * @function normalizeResourceFormat
 * Normalizes the resource format to be App compliant
 */
export function normalizeResourceFormat(format) {
  return format ? format.split('_')[0] : null;
}

/**
 * @function getDefaultImage
 * Method used to get default image based on format
 */
export function getDefaultImage(format: string) {
  let defaultImg;
  if (format === CONTENT_TYPES.ASSESSMENT || format === CONTENT_TYPES.ASSESSMENT_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES.ASSESSMENT;
  } else if (format === CONTENT_TYPES.COLLECTION || format === CONTENT_TYPES.COLLECTION_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES.COLLECTION;
  } else {
    defaultImg = DEFAULT_IMAGES.OFFLINE_ACTIVITY;
  }
  return defaultImg;
}

/**
 * @function getDefaultImageXS
 * Method used to get default image based on format
 */
export function getDefaultImageXS(format: string) {
  let defaultImg;
  if (format === CONTENT_TYPES.ASSESSMENT || format === CONTENT_TYPES.ASSESSMENT_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES_XS.ASSESSMENT;
  } else if (format === CONTENT_TYPES.COLLECTION || format === CONTENT_TYPES.COLLECTION_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES_XS.COLLECTION;
  } else {
    defaultImg = DEFAULT_IMAGES.OFFLINE_ACTIVITY;
  }
  return defaultImg;
}

/**
 * @function getDefaultResourceImage
 * Method used to get default image based on resource format
 */
export function getDefaultResourceImage(format: string) {
  return RESOURCES_DEFAULT_IMAGES[format];
}

/**
 * @function getTaxonomySubjectId
 *  Method used to Parse and read subject id for given string
 */
export function getTaxonomySubjectId(id, code) {
  const ids = id.substring(0, id.indexOf('-'));
  return `${code}.${ids}`;
}

/**
 * @function getDomainId
 *  Method used to Parse and read domain id for given string
 */
export function getDomainId(id, code) {
  const ids = id.split('-');
  return `${code}.${ids[0]}-${ids[1]}-${ids[2]}`;
}

/**
 * @function getCourseId
 *  Method used to Parse and read course id for given string
 */
export function getCourseId(id, code) {
  const ids = id.split('-');
  return `${code}.${ids[0]}-${ids[1]}`;
}

/**
 * @function isMicroStandardId
 *  Method used to check the micro standard id
 */
export function isMicroStandardId(id) {
  return /.*\d{2}-\d{2}/.test(id) || /.*\.\d{2}\.\d{2}\./.test(id);
}

/**
 * @function getDomainCode
 *  Method used to read domain code for given string
 */
export function getDomainCode(id) {
  const ids = id.split('-');
  return ids[2];
}

/**
 * @function getCategoryCodeFromSubjectId
 *  Method used to get a category object from a subjectId
 */
export function getCategoryCodeFromSubjectId(subjectId) {
  const categoryCode = subjectId.split('.');
  return categoryCode.length === 3 ? categoryCode[1] : categoryCode[0];
}

/**
 * @function flattenGutToFwDomain
 *  Method used to parse and form a json object
 */
export function flattenGutToFwDomain(competencyMatrixs) {
  return competencyMatrixs.map(competencyMatrix => {
    return {
      [competencyMatrix.domainCode]: competencyMatrix
    };
  });
}

/**
 * @function flattenGutToFwCompetency
 *  Method used to parse and form a json object
 */
export function flattenGutToFwCompetency(competencyMatrixs) {
  const fwCompetencies = [];
  competencyMatrixs.map(competencyMatrix => {
    competencyMatrix.topics.forEach((topic) => {
      const competencies = topic.competencies;
      competencies.forEach(competency => {
        fwCompetencies.push({
          [competency.competencyCode]: competency
        });
      });
    });
   });
  return fwCompetencies;
}

/**
 * @function getLastSegmentFromUrl
 * Method used to get last segment from given url
 */
export function getLastSegmentFromUrl(url) {
  return url.match(/([^\/]*)\/*$/)[1];
}

/**
 * @function calculatePercentage
 * Method used to calculate the percentage
 */
export function calculatePercentage(value = 0, totalValue = 0) {
  return Math.round((value / totalValue) * 100);
}

/**
 * @function cloneObject
 * Method used to to clone the array and object
 */
export function cloneObject(obj) {
  return Array.isArray(obj)
    ? obj.map((item) => cloneObject(item))
    : obj && typeof obj === 'object'
      ? Object.getOwnPropertyNames(obj).reduce((o, prop) => {
        o[prop] = cloneObject(obj[prop]);
        return o;
      }, {})
      : obj;
}

/**
 * @function currentWeekDates
 * Method used to get current week dates
 */
export function currentWeekDates() {
  const currentDate = moment();
  const weekStart = currentDate.clone().startOf('week');
  const days = [];
  for (let i = 0; i <= 6; i++) {
    days.push(moment(weekStart).add(i, 'days').format('YYYY-MM-DD'));
  }
  return days;
}

/**
 * @function previousWeekDates
 * Method used to get previous week dates
 */
export function previousWeekDates() {
  const currentDate = moment();
  const previousWeekStart = currentDate.subtract(1, 'weeks').startOf('week');
  const days = [];
  for (let i = 0; i <= 6; i++) {
    days.push(moment(previousWeekStart).add(i, 'days').format('YYYY-MM-DD'));
  }
  return days;
}

/**
 * @function getSubjectIdFromSubjectBucket
 *  Method used to Extract subject id by ignoring framework code, if available
 */
export function getSubjectIdFromSubjectBucket(subjectBucket) {
  const subjectBucketSize = subjectBucket.split('.');
  let taxonomySubject = subjectBucket;
  if (subjectBucketSize.length > 2) {
    // subject with framework
    taxonomySubject = subjectBucket.substring(subjectBucket.indexOf('.') + 1);
  }
  return taxonomySubject;
}

// function to remove duplicate object from array
export function removeDuplicateValues(inputArrayValues, id) {
  return inputArrayValues.filter(
    (currentElement, index, array) =>
      array.findIndex((element) => element[id] === currentElement[id]) ===
      index
  );
}

// function to convert date object to formated date string
export function formatDate(date) {
  const day = date.day.toString();
  const month = (date.month + 1).toString();
  const formatedDate = `${date.year}-${formatDigit(month)}-${formatDigit(
    day
  )}`;
  return formatedDate;
}

// function to convert month date object to formated date string
export function formatMonthDate(date) {
  const month = date.month.toString();
  const formatedDate = `${date.year}-${formatDigit(month)}-01`;
  return formatedDate;
}

// function to used to get all dates in a given month and year
export function getAllDatesInMonth(year, month) {
  const startDateOfMonth = moment([year, month - 1]);
  const result = [];
  let daysInMonth = startDateOfMonth.daysInMonth();
  while (daysInMonth) {
    const currentDate = moment([year, month - 1]).date(daysInMonth);
    result.push(currentDate);
    daysInMonth--;
  }
  return result;
}

// function to used to group by given key value
export function groupBy(arrayList, property) {
  return arrayList.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, []);
}

// function to used to group by given key value
export function groupByTwoColumns(arrayList, property1, property2) {
  return arrayList.reduce((acc, obj) => {
    const key = obj[property1][property2];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, []);
}

// function to used to format single digit value
export function formatDigit(value) {
  value = value.toString();
  return value.length > 1 ? value : `0${value}`;
}


/**
 * Returns filename from url
 * @param {String} file complete url
 */
export function cleanFilename(url, cdnUrls) {
  const defaultImages = Object.values(DEFAULT_IMAGES).map((item) => item);
  if (url) {
    if (cdnUrls) {
      url = url.replace(cdnUrls.content, '');
      url = url.replace(cdnUrls.user, '');
    }
  }

  return url && !isDefaultImage(defaultImages, url)
    ? /([^/]*\/\/[^/]+\/)?(.+)/.exec(url)[2]
    : '';
}


/**
 * check if is a config default image
 * @param {string []} config default images
 * @param {string} url of file
 */
function isDefaultImage(defaultImages, url) {
  let isDefaultImageExist = false;

  defaultImages.forEach((image) => {
    if (url.indexOf(image) >= 0) {
      isDefaultImageExist = true;
    }
  });

  return isDefaultImageExist;
}

// function to check url is image
export function checkUrlIsImage(url) {
  return (url.match(/\.(jpeg|jpg|gif|png|svg)$/) != null);
}

/**
 * This function is used to clear up fields when serializing then. At the
 * BE a null field will delete the value at the repository a non present field (undefined) would be ignored (not changed).
 *
 * Returns null if value is empty or null
 * Returns undefined if value is undefined
 * Otherwise it returns value
 * @param {string} value
 */
export function nullIfEmpty(value) {
  let toReturn = value;
  if (value !== undefined) {
    toReturn = value && value.length ? value : null;
  }
  return toReturn;
}

/**
 * Returns a date in timestamp
 * @param {Date} date
 * @returs {number} timestamp
 */
export function toTimestamp(date) {
  return date ? date.getTime() : date;
}

/**
 * @function getObjectsDeepCopy
 * @param {Array} objectElements
 * @return {Ember.Array} clonedObjectElements
 * Method to perform deep copy of list of objects
 */
export function getObjectsDeepCopy(objectElements) {
  const clonedObjectElements = [];
  if (Array.isArray(objectElements)) {
    objectElements.map((originalObject) => {
      clonedObjectElements.push(getObjectCopy(originalObject));
    });
  }
  return clonedObjectElements;
}

/**
 * @function getObjectCopy
 * @param {Object} originalObject
 * @return {Ember.Object} clonedObject
 * Method to perform object copy
 */
export function getObjectCopy(originalObject) {
  const clonedObject = {};
  const objectKeys = Object.keys(originalObject);
  objectKeys.map(key => {
    clonedObject[`${key}`] = originalObject[key];
  });
  return clonedObject;
}

// function to used to get local time
export function toLocal(timestamp) {
  return moment.utc(timestamp).toDate();
}

// Generates UUID
export function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      // tslint:disable-next-line
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

// Method to round milliseconds
export function roundMilliseconds(mins = 0, sec = 0) {
  return (mins * 60 + sec) * 1000;
}

/**
 * @function getPredefinedRouteFromUrl
 * This Method is used to get predefined route from url
 */
export function getPredefinedRouteFromUrl(url) {
  return url.split('/')[3];
}

/*
 * @function getTimeInMillisec
 * @param {Number} hour
 * @param {Number} minute
 * @return {Number}
 * Method to convert given hour and minute into milliseconds
 */
export function getTimeInMillisec(hour = 0, minute = 0) {
  return (hour * 60 * 60 + minute * 60) * 1000;
}

/**
 * @function sortBy
 * This Method is used to sort array values
 */
export function sortBy(array, sortingKey, sortingType = SORTING_TYPES.descending) {
  array.sort((a: any, b: any) => {
    const nameA = sortingType === SORTING_TYPES.descending && b[sortingKey].toLowerCase() || a[sortingKey].toLowerCase();
    const nameB = sortingType === SORTING_TYPES.descending && a[sortingKey].toLowerCase() || b[sortingKey].toLowerCase();
    if (nameA < nameB) // sort string ascending
      return -1
    if (nameA > nameB)
      return 1
    return 0 // default return value (no sorting)
  });
  return array;
}

/**
 * @function sortByNumber
 * This Method is used to sort by number
 */
export function sortByNumber(array, sortingKey, sortingType) {
  return array.sort((a, b) =>
    SORTING_TYPES.ascending === sortingType
      ? Number(a[sortingKey]) - Number(b[sortingKey])
      : Number(b[sortingKey]) - Number(a[sortingKey])
  );
}

/**
 * @function sortByDate
 * This Method is used to sort by date
 */
export function sortByDate(array, sortingKey, sortingType) {
  return array.sort((a, b) =>
    SORTING_TYPES.ascending === sortingType
      ? (new Date(a[sortingKey]) as any) - (new Date(b[sortingKey]) as any)
      : (new Date(b[sortingKey]) as any) - (new Date(a[sortingKey]) as any)
  );
}

/**
 *  generateArraysOfTime
 * @type {String}
 */
export function generateArraysOfTime(start = '00:00', end = '24:00') {
  const startTime = moment(start, 'HH:mm');
  const endTime = moment(end, 'HH:mm');
  if (endTime.isBefore(startTime)) {
    endTime.add(1, 'day');
  }
  const timeStops = [];
  while (startTime < endTime) {
    timeStops.push(moment(startTime).format('h:mma'));
    startTime.add(15, 'minutes');
  }
  return timeStops;
}

/**
 *  formatimeToDateTime
 * @type {String}
 */
export function formatimeToDateTime(time, date = null) {
  if (date) {
    return moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm a')
      .utc()
      .format('YYYY-MM-DD[T]HH:mm:ssZ');
  }
  return moment(time, 'hh:mm a')
    .utc()
    .format('YYYY-MM-DD[T]HH:mm:ssZ');
}

/**
 *  formatimeToDateTime
 * @type {String}
 */
export function dateTimeToTime(value) {
  const endTime = moment
    .utc(value)
    .local()
    .format('hh:mm A');
  return endTime;
}

// This Method is used to get route from url
export function getRouteFromUrl(url) {
  const routes = url.split('/');
  const routePath = routes[routes.length - 1];
  const pathParams = routePath.split('?');
  if (pathParams.length) {
    return pathParams[0];
  }
  return routePath;
}

/**
 * @function compareVersions
 * This Method is used to compare versions
 */
 export function compareVersions(v1, comp, v2) {
  const comparator = comp === '=' ? '==' : comp;
  if (
    ['==', '===', '<', '<=', '>', '>=', '!=', '!=='].indexOf(comparator) ===
    -1
  ) {
    throw new Error('Invalid comparator. ' + comparator);
  }
  const v1parts = v1.split('.');
  const v2parts = v2.split('.');
  const maxLen = Math.max(v1parts.length, v2parts.length);
  let part1;
  let part2;
  let cmp = 0;
  for (let i = 0; i < maxLen && !cmp; i++) {
    part1 = parseInt(v1parts[i], 10) || 0;
    part2 = parseInt(v2parts[i], 10) || 0;
    if (part1 < part2) {
      cmp = 1;
    }
    if (part1 > part2) {
      cmp = -1;
    }
  }
  return eval('0' + comparator + cmp);
}

/**
 * @function formUrlQueryParameters
 * This Method is used to form url query params
 */
 export function formUrlQueryParameters(data) {
  const urlParameters = Object.entries(data).map(e => e.join('=')).join('&');
  return urlParameters;
}

/**
 * @function getInBetweenValue
 * This Method is used to get in between values
 */
export function getInBetweenValue(character, charFrom, charTo) {
  return character.match(charFrom + '(.*)' + charTo)[1].trim();
}

/**
 * @function convertNumberIntoChar
 * This method is used to convert number into character
 */
export function convertNumberIntoChar(number) {
  return String.fromCharCode(65 + number);
}

/**
 * Parse and read subject id for given string
 * @param  {String} id
 * @return {String}
 */
export function getTaxonomyStandard(id) {
  return id.substring(0, id.indexOf('-'));
}

/**
 * Method used to get a taxonomy keys from a subjectId
 *
 */
export function getSubjectId(id) {
 const taxonomyId = id.substring(0, id.indexOf('-'));
 const taxonomyCode = taxonomyId.split('.');
 return taxonomyCode.length > 1 && taxonomyCode[1] + '.' + taxonomyCode[2];
}
