import { average, roundFloat, sumAll } from '@utils/math';
import * as moment from 'moment';

/**
 * @function aggregateCAPerformanceScore
 * This method is used to aggregrate CA performance
 */
export function aggregateCAOverallPerformanceScore(contentType, items) {
  let aggregatedScoreValue = null;
  if (items && items.length) {
    aggregatedScoreValue = 0;
    items.map(item => {
      const itemPerformanceScore = item[contentType].score;
      aggregatedScoreValue += itemPerformanceScore ? itemPerformanceScore : 0;
    });
    aggregatedScoreValue = aggregatedScoreValue / items.length;
  }
  return roundFloat(aggregatedScoreValue);
}

/**
 * @function aggregateCAPerformanceTimeSpent
 * This method is used to aggregrate timespent performance
 */
export function aggregateCAOverallPerformanceTimeSpent(contentType, items, doAverage) {
  let aggregatedTimeSpentValue = 0;
  if (items && items.length) {
    aggregatedTimeSpentValue = 0;
    items.map((item) => {
      const itemPerformanceTimeSpent = item[contentType].timespent;
      aggregatedTimeSpentValue += itemPerformanceTimeSpent
        ? itemPerformanceTimeSpent
        : 0;
    });
    if(doAverage) {
      aggregatedTimeSpentValue = (aggregatedTimeSpentValue / items.length);
    }
  }
  return roundFloat(aggregatedTimeSpentValue);
}

/**
 * @function aggregateMilestonePerformanceScore
 * This method is used to aggregrate milestone performance
 */
export function aggregateMilestonePerformanceScore(items) {
  let aggregatedScoreValue = null;
  if (items && items.length) {
    aggregatedScoreValue = 0;
    items.map((item) => {
      const itemPerformanceScore = item.performance.scoreInPercentage;
      aggregatedScoreValue += itemPerformanceScore ? itemPerformanceScore : 0;
    });
    aggregatedScoreValue = aggregatedScoreValue / items.length;
  }
  return roundFloat(aggregatedScoreValue);
}

/**
 * @function aggregateMilestonePerformanceTimeSpent
 * This method is used to aggregrate timespent performance
 */
export function aggregateMilestonePerformanceTimeSpent(items) {
  let aggregatedTimeSpentValue = null;
  if (items && items.length) {
    aggregatedTimeSpentValue = 0;
    items.map(item => {
      const itemPerformanceTimeSpent = item.performance.timespent;
      aggregatedTimeSpentValue += itemPerformanceTimeSpent
        ? itemPerformanceTimeSpent
        : 0;
    });
  }
  return roundFloat(aggregatedTimeSpentValue);
}

/**
 * @function aggregateMilestonePerformanceScore
 * This method is used to aggregrate milestone performance
 */
export function aggregateCAPerformanceScore(items) {
  let aggregatedScoreValue = null;
  if (items && items.length) {
    aggregatedScoreValue = 0;
    items.map(item => {
      const itemPerformanceScore = item.score;
      aggregatedScoreValue += itemPerformanceScore ? itemPerformanceScore : 0;
    });
    aggregatedScoreValue = (aggregatedScoreValue / items.length) * 100;
  }
  return roundFloat(aggregatedScoreValue);
}

/**
 * @function aggregateMilestonePerformanceTimeSpent
 * This method is used to aggregrate timespent performance
 */
export function aggregateCAPerformanceTimeSpent(items) {
  let aggregatedTimeSpentValue = null;
  if (items && items.length) {
    aggregatedTimeSpentValue = 0;
    items.map(item => {
      const itemPerformanceTimeSpent = item.time_spent;
      aggregatedTimeSpentValue += itemPerformanceTimeSpent
        ? itemPerformanceTimeSpent
        : 0;
    });
  }
  return roundFloat(aggregatedTimeSpentValue);
}

/**
 * @function calculateAverageByItem
 * This method is used to aggregrate average
 */
export function calculateAverageByItem(itemId, fieldName, studentPerformanceData = [], doRoundValue = true) {
  let avgValue = -1;
  if (studentPerformanceData && studentPerformanceData.length) {
    let counter = 0;
    let sumValue = 0;
    if (studentPerformanceData && studentPerformanceData.length) {
      studentPerformanceData.forEach((studentPerformance) => {
        if (studentPerformance && studentPerformance.performance[fieldName] !== null) {
          const studentScore = studentPerformance.performance[fieldName];
          if (studentScore !== undefined && !isNaN(studentScore)) {
            sumValue += studentScore;
            counter += 1;
          }
        }
      });
    }
    if (sumValue !== null && !isNaN(sumValue) && counter) {
      avgValue = sumValue / counter;
      if (doRoundValue) {
        avgValue = roundFloat(avgValue);
      }
    } else {
      avgValue = null;
    }
  }
  return avgValue;
}

/**
 * Helper function to calculate the summatory of a specified field by unit, lesson or collection|statement.
 */
export function calculateSumByItem(itemId, fieldName, studentPerformanceData = [], doRoundValue = true) {
  let sumValue = 0;
  if (studentPerformanceData && studentPerformanceData.length > 0) {
    studentPerformanceData.forEach((studentPerformance) => {
      if (studentPerformance && studentPerformance.performance[fieldName] !== null) {
        sumValue += studentPerformance.performance[fieldName];
      }
    });
    if (doRoundValue) {
      sumValue = roundFloat(sumValue);
    }
  }
  return sumValue;
}

/**
 * @function findNumberOfStudentsByItem
 * This method is used to find number of students
 */
export function findNumberOfStudentsByItem(itemId, studentPerformanceData = [], type) {
  let numberOfStudents = 0;
  const id = `${type}Id`;
  if (studentPerformanceData && studentPerformanceData.length) {
    studentPerformanceData.forEach((studentPerformance) => {
      if (studentPerformance && studentPerformance.performance) {
        if (studentPerformance[id] === itemId) {
          numberOfStudents++;
        }
      }
    });
  }
  return numberOfStudents;
}

export function aggregateOfflineClassActivityPerformanceSummaryItems(activityPerformanceSummaryItems) {
  const aggregatedClassActivities = [];
  const dcaContentIds = activityPerformanceSummaryItems.map((item) => item.dcaContentId);
  dcaContentIds.forEach((dcaContentId) => {
    const activities = activityPerformanceSummaryItems.filter((item) => item.dcaContentId === dcaContentId);
    const dcaContentCollectionPerformanceSummaryItems = activities.map((item) => item.collectionPerformanceSummary);
    const collectionIds = dcaContentCollectionPerformanceSummaryItems.map((item) => item.collectionId);
    collectionIds.forEach((collectionId) => {
      const collectionPerformanceSummaryItems = dcaContentCollectionPerformanceSummaryItems.filter((item) => item.collectionId === collectionId);
      const aggregatedActivity = {
        dcaContentId,
        collectionPerformanceSummary: aggregateCollectionPerformanceSummaryItems(collectionPerformanceSummaryItems),
        userId: activities && activities.length && activities[0].userId || null
      };
      aggregatedClassActivities.push(aggregatedActivity);
    });
  });
  return aggregatedClassActivities;
}

export function aggregateClassActivityPerformanceSummaryItems(activityPerformanceSummaryItems) {
  const aggregatedClassActivities = [];
  const dates = activityPerformanceSummaryItems
    .map((item) => item.date);
  dates.forEach((date) => {
    const activitiesPerDate = activityPerformanceSummaryItems
      .filter((item) => item.date === date);
    const dateCollectionPerformanceSummaryItems = activitiesPerDate
      .map((item) => item.collectionPerformanceSummary);
    const collectionIds = dateCollectionPerformanceSummaryItems
      .map((item) => item.collectionId);
    collectionIds.forEach((collectionId) => {
      const collectionPerformanceSummaryItems = dateCollectionPerformanceSummaryItems.filter((item) => item.collectionId === collectionId);
      const aggregatedActivity = {
        date: moment(date),
        activationDate: moment(date).format('YYYY-MM-DD'),
        collectionPerformanceSummary: aggregateCollectionPerformanceSummaryItems(collectionPerformanceSummaryItems)
      };
      aggregatedClassActivities.push(aggregatedActivity);
    });
  });
  return aggregatedClassActivities;
}

export function aggregateCollectionPerformanceSummaryItems(collectionPerformanceSummaryItems) {
  const timeSpentValues = collectionPerformanceSummaryItems
    .map((item) => {
      return item.timeSpent;
    })
    .filter((timeSpent) => {
      return timeSpent !== undefined; // throw away any instances which are not undefined
    });

  const scoreValues = collectionPerformanceSummaryItems
    .map((item) => {
      return item.score;
    })
    .filter((score) => {
      return score !== undefined; // throw away any instances which are not undefined
    });

  const attemptsValues = collectionPerformanceSummaryItems
    .map((item) => {
      return item.attempts;
    })
    .filter((attempts) => {
      return attempts !== undefined; // throw away any instances which are not undefined
    });

  const collectionId = collectionPerformanceSummaryItems[0].collectionId;
  const lastIndex = collectionPerformanceSummaryItems.length - 1;
  const sessionId = collectionPerformanceSummaryItems[lastIndex].sessionId;
  return {
    collectionId,
    sessionId,
    timeSpent: timeSpentValues.length > 0 ? average(timeSpentValues) : null,
    score: scoreValues.length > 0 ? average(scoreValues) : null,
    attempts: attemptsValues.length > 0 ? sumAll(attemptsValues) : null
  };
}

/**
 * @function getContentId
 * This method is used to get content id
 */
export function getCAContentIds(activities, contentType) {
  const caContentIds = activities
    .filter((item) => item.contentType.includes(contentType))
    .map((item) => item.isOfflineActivity ? item.id : item.contentId);
  return [...new Set(caContentIds)];
}

/**
 * @function getMinDateOfActivity
 * This method is used to get min date of activity
 */
export function getMinDateOfActivity(activities) {
  const sortedActivities = activities.sort((a, b) => {
    return (
      new Date(a.dcaAddedDate).getTime() -
      new Date(b.dcaAddedDate).getTime()
    );
  });
  return sortedActivities.length ? sortedActivities[0].dcaAddedDate : null;
}

/**
 * @function getMaxDateOfActivity
 * This method is used to get max date of activity
 */
export function getMaxDateOfActivity(activities) {
  const sortedActivities = activities.sort((a, b) => {
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });
  return sortedActivities.length ? sortedActivities[0].endDate : null;
}

/**
 * @function convertScoreInPercentage
 * This method is used to convert score in percentage
 */
export function convertScoreInPercentage(score, maxScore) {
  if (score > 1) {
    return score;
  } else if (score) {
    return (score / maxScore) * 100;
  }
  return 0;
}

// function to used to group by given key value
export function groupUserActivities(arrayList, property) {
  return arrayList.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key] = acc[key].concat(obj.activity);
    return acc;
  }, []);
}
