const fs = require("fs");

function main() {
  const guest = JSON.parse(fs.readFileSync("guest.json", "utf8"));

  var mostRecentWebSession = getMostRecendWebSession(guest);
  console.log(
    "has view event:",
    sessionHasEventOfTypeX(mostRecentWebSession, "VIEW"),
  );
  console.log("num of sessions:", getNumberOfSessions(guest));
  console.log("ext value:", getDataExtensionValue(guest, "ext", "companyName"));
  console.log("has orders:", hasOrders(guest));
  console.log("most recent order date:", getMostRecentOrderDate(guest));
  console.log("segment memberships:", getSegmentMemberships(guest));
  console.log("is in 'with_emails' segment", isInSegment(guest, "with_emails"));
  console.log("is in 'fake_segment' segment", isInSegment(guest, "NOT"));

  console.log("total num of orders", getTotalNumberOfOrders(guest));
  console.log("most recent order, order items names", getMostRecentOrderItems(guest));
  console.log("total order value:", getTotalOrderValue(guest));
  console.log("average order value:", getAverageOrderValue(guest));
  console.log("AverageAnnualOrders:", getAverageAnnualOrders(guest));

  console.log("most viewed page:", getMostViewedPage(guest));
  console.log(
    "most viewed product page:",
    getMostViewedProductPage(guest, "/products/"),
  );
  

  console.log("most frequent event", getMostFrequentEvent(guest, ["TRACKING", "VIEW"]))

   console.log("experiecnes seen:", getExperienceExecutions(guest))
}

main();

function getMostRecendWebSession(guest) {
  for (let i = 0; i < guest.sessions.length; i++) {
    if (guest.sessions[i].channel === "WEB") {
      return guest.sessions[i];
    }
  }
  return null;
}

function sessionHasEventOfTypeX(session, typeX) {
  for (let i = 0; i < session.events.length; i++) {
    if (session.events[i].type === typeX) {
      return true;
    }
  }
  return false;
}

function getNumberOfSessions(guest) {
  return guest.sessions.length;
}

function getDataExtensionValue(guest, dataExtensionName, dataExtensionKey) {
  for (let i = 0; i < guest.dataExtensions.length; i++) {
    if (guest.dataExtensions[i].name === dataExtensionName) {
      if (guest.dataExtensions[i].values[dataExtensionKey]) {
        return guest.dataExtensions[i].values[dataExtensionKey];
      }
    }
  }
  return null;
}

function hasOrders(guest) {
  return guest.orders && guest.orders.length > 0;
}

function getTotalNumberOfOrders(guest) {
  return guest.orders.length;
}

function getMostRecentOrder(guest) {
  for (let i = 0; i < guest.orders.length; i++) {
    return guest.orders[i];
  }
  return null;
}

function getMostRecentOrderDate(guest) {
  const mostRecentOrder = getMostRecentOrder(guest);
  if (mostRecentOrder) {
    return new Date(mostRecentOrder.orderedAt);
  }
  return null;
}

function getSegmentMemberships(guest) {
  const segmentMemberships = [];
  for (let i = 0; i < guest.segmentMemberships.length; i++) {
    segmentMemberships.push(guest.segmentMemberships[i].name);
  }
  return segmentMemberships;
}

function isInSegment(guest, segmentName) {
  for (let i = 0; i < guest.segmentMemberships.length; i++) {
    if (guest.segmentMemberships[i].name === segmentName) {
      return true;
    }
  }
  return false;
}

function isInSegmentIgnoreCase(guest, segmentName) {
  for (let i = 0; i < guest.segmentMemberships.length; i++) {
    if (
      guest.segmentMemberships[i].name.toLowerCase() ===
      segmentName.toLowerCase()
    ) {
      return true;
    }
  }
  return false;
}

function getMostRecentOrderItems(guest) {
  const mostRecentOrder = getMostRecentOrder(guest);
  const orderItems = mostRecentOrder ? mostRecentOrder.orderItems : [];
  const orderItemNames = [];
  for (let i = 0; i < orderItems.length; i++) {
    orderItemNames.push(orderItems[i].name);
  }
  return orderItemNames;
}

function getTotalOrderValue(guest) {
  let totalValue = 0;
  for (let i = 0; i < guest.orders.length; i++) {
    totalValue += guest.orders[i].price;
  }
  return totalValue;
}

function getAverageOrderValue(guest) {
  if (guest.orders.length === 0) {
    return 0;
  }

  let totalValue = getTotalOrderValue(guest);
  return Math.floor(totalValue / guest.orders.length);
}

function getAverageAnnualOrders(guest) {
  const currentYear = new Date().getFullYear();
  let orderYears = {};

  for (let i = 0; i < guest.orders.length; i++) {
    const orderYear = new Date(guest.orders[i].orderedAt).getFullYear();
    if (!orderYears[orderYear]) {
      orderYears[orderYear] = 1;
    } else {
      orderYears[orderYear]++;
    }
  }

  let totalOrders = 0;
  let totalYears = 0;
  for (const year in orderYears) {
    totalOrders += orderYears[year];
    if (year <= currentYear) {
      totalYears++;
    }
  }

  return Math.round(totalOrders / totalYears);
}

function getMostViewedPage(guest) {
  let pageViews = {};
  let maxViews = 0;
  let mostViewedPage = "";

  for (let i = 0; i < guest.sessions.length; i++) {
    for (let j = 0; j < guest.sessions[i].events.length; j++) {
      const event = guest.sessions[i].events[j];
      if (event.type === "VIEW") {
        const pageName = event.arbitraryData.page;
        if (!pageViews[pageName]) {
          pageViews[pageName] = 1;
        } else {
          pageViews[pageName]++;
        }

        if (pageViews[pageName] > maxViews) {
          maxViews = pageViews[pageName];
          mostViewedPage = pageName;
        }
      }
    }
  }

  return mostViewedPage;
}

function getMostViewedProductPage(guest, productURLStringContains) {
  let pageViews = {};
  let maxViews = 0;
  let mostViewedPage = "";

  for (let i = 0; i < guest.sessions.length; i++) {
    for (let j = 0; j < guest.sessions[i].events.length; j++) {
      const event = guest.sessions[i].events[j];
      if (
        event.type === "VIEW" &&
        event.arbitraryData.page.includes(productURLStringContains)
      ) {
        const pageName = event.arbitraryData.page;
        if (!pageViews[pageName]) {
          pageViews[pageName] = 1;
        } else {
          pageViews[pageName]++;
        }

        if (pageViews[pageName] > maxViews) {
          maxViews = pageViews[pageName];
          mostViewedPage = pageName;
        }
      }
    }
  }

  return mostViewedPage;
}

function getMostFrequentEvent(guest, ignoreEventTypes = []) {
  let eventCounts = {};
  let maxCount = 0;
  let mostFrequentEvent = "";

  for (let i = 0; i < guest.sessions.length; i++) {
    for (let j = 0; j < guest.sessions[i].events.length; j++) {
      const eventType = guest.sessions[i].events[j].type;
      if (!ignoreEventTypes.includes(eventType)) {
        if (!eventCounts[eventType]) {
          eventCounts[eventType] = 1;
        } else {
          eventCounts[eventType]++;
        }

        if (eventCounts[eventType] > maxCount) {
          maxCount = eventCounts[eventType];
          mostFrequentEvent = eventType;
        }
      }
    }
  }

  return mostFrequentEvent;
}
 

function getExperienceExecutions(guest) {
  let seenExperiences = [];
  for (let i = 0; i < guest.sessions.length; i++) {
    for (let j = 0; j < guest.sessions[i].events.length; j++) {
      const event = guest.sessions[i].events[j];
      if (event.type === "TRACKING" && event.arbitraryData.flowExecution.status === "SUCCESS") {
        const flowFriendlyId = event.arbitraryData.flowExecution.flowFriendlyId;
        if (!seenExperiences.includes(flowFriendlyId)) {
          seenExperiences.push(flowFriendlyId);
        }
      }
    }
  }
  return seenExperiences;
}



//write a function called getMostViewedPage(guest) which takes in a guest object and returns the name of the page that was viewed the most.


//write a function called getExperiencesSeen which looks at all events of type "TRACKING" and  returns an array of strings which is the flowFriendlyId of the trackingEvent.arbitraryData.flowExecution.flowFriendlyId, also the TRACKING event needs to have a arbitraryData.flowExecution.status of "SUCCESS, use only standard for loops", return only unique values