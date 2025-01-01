import { google } from "googleapis";
import { GOOGLE_CALENDAR_STR } from "../../constants/appNameStr.js";
import { authorizeGoogleDrive } from "./drive.js";

export async function getEventsFromCalendar(accessToken, user_id, organization) {
  const authClient = await authorizeGoogleDrive(accessToken);
  const events = await listGoogleCalendarEvents(authClient, user_id, organization);
  const eventDataToInsert = events.map((event) => {
    return {
      updateOne: {
        filter: { event_id: event.id, user_id, organization },
        update: {
          $set: {
            event_id: event.id,
            user_id,
            organization,
            data: event,
            app_name: GOOGLE_CALENDAR_STR,
          },
        },
        upsert: true,
      },
    };
  });
  await Filedata.bulkWrite(eventDataToInsert);
}

export function listGoogleCalendarEvents(auth, calendarId = "primary", maxResults = 1000) {
  return new Promise((resolve, reject) => {
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: calendarId,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: "startTime",
      },
      (err, res) => {
        if (err) {
          console.error("The API returned an error:", err);
          return reject(err);
        }
        const events = res.data.items;
        if (events.length) {
          resolve(events);
        } else {
          console.log("No events found on Google Calendar.");
          resolve([]); // Return an empty array if no events are found
        }
      }
    );
  });
}

export async function getGoogleCalendarEventDetails(auth, eventId, calendarId = "primary") {
  try {
    const calendar = google.calendar({ version: "v3", auth });
    const eventDetails = await calendar.events.get({
      calendarId: calendarId,
      eventId: eventId,
    });

    return eventDetails.data;
  } catch (err) {
    console.error("Error retrieving event details:", err);
    throw new Error("Failed to retrieve event details");
  }
}

export async function listGoogleCalendarEventsRecursively(authClient, user_id, organization, calendarId = "primary", maxResults = 1000) {
  const events = await listGoogleCalendarEvents(authClient, calendarId, maxResults);
  const eventDataToInsert = [];

  for (const event of events) {
    // Add event data to the batch
    eventDataToInsert.push({
      updateOne: {
        filter: { event_id: event.id, user_id, organization },
        update: {
          $set: {
            event_id: event.id,
            user_id,
            organization,
            data: event,
          },
        },
        upsert: true,
      },
    });
  }

  return eventDataToInsert;
}

export async function dataOrganizer(data = [], user) {
  const email = user?.email;
  const organization = user?.organization;

  const organizationDomain = organization?.domain;

  return data.map((item) => {
    const eventData = item?.data;
    const result = (eventData.attendees || []).reduce(
      (acc, { email }) => {
        if (!email) return acc;
        email.endsWith(`@${organizationDomain}`)
          ? acc.internal.push(email)
          : acc.external.push(email);

        return acc;
      },
      { internal: [], external: [] }
    );
    item.data = {
      ...item.data,
      internalCount: result.internal.length,
      externalCount: result.external.length,
      internalAttendees: result.internal,
      externalAttendees: result.external,
    };
    return item;
  });
}
