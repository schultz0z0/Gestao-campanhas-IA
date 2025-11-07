/**
 * Date validation and adjustment for AI-generated actions
 */

export interface ActionWithDate {
  scheduledDate?: string | Date;
  [key: string]: any;
}

/**
 * Validate and adjust dates to ensure they fall within campaign period
 */
export function validateAndAdjustDates<T extends ActionWithDate>(
  actions: T[],
  campaignStartDate: Date,
  campaignEndDate: Date
): T[] {
  return actions.map((action) => {
    let finalDate: Date;

    if (!action.scheduledDate) {
      // If no date specified, assign a random date within campaign period
      finalDate = getRandomDateInRange(campaignStartDate, campaignEndDate);
    } else {
      const actionDate = new Date(action.scheduledDate);

      // Check if date is within campaign period
      if (actionDate < campaignStartDate || actionDate > campaignEndDate) {
        console.warn(
          `Action date ${actionDate} outside campaign period. Adjusting...`
        );

        // Adjust to nearest valid date
        if (actionDate < campaignStartDate) {
          finalDate = campaignStartDate;
        } else {
          finalDate = campaignEndDate;
        }
      } else {
        finalDate = actionDate;
      }
    }

    // Convert to ISO string (YYYY-MM-DD format for PostgreSQL date columns)
    return {
      ...action,
      scheduledDate: finalDate.toISOString().split('T')[0],
    };
  });
}

/**
 * Get a random date within a range
 */
function getRandomDateInRange(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Distribute dates evenly across campaign period
 */
export function distributeActionsEvenly<T extends ActionWithDate>(
  actions: T[],
  campaignStartDate: Date,
  campaignEndDate: Date
): T[] {
  const totalDuration = campaignEndDate.getTime() - campaignStartDate.getTime();
  const interval = totalDuration / (actions.length + 1);

  return actions.map((action, index) => {
    const scheduledTime = campaignStartDate.getTime() + interval * (index + 1);
    const scheduledDate = new Date(scheduledTime);
    
    // Convert to ISO string (YYYY-MM-DD format for PostgreSQL date columns)
    return {
      ...action,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
    };
  });
}
