import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GoogleService } from './google.service';

@Injectable()
export class CalendarService {
  constructor(private googleService: GoogleService) { }

  async getBusySlots(from: string, to: string) {
    const accessToken = await this.googleService.getAccessToken();

    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        timeMin: new Date(from).toISOString(),
        timeMax: new Date(to).toISOString(),
        timeZone: process.env.GOOGLE_TIMEZONE,
        items: [{ id: 'primary' }],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data.calendars.primary.busy;
  }

async getEvents(from?: string, to?: string) {
  const accessToken = await this.googleService.getAccessToken();

  const params: any = {
    singleEvents: true,
    orderBy: 'startTime',
  };

  //  Handle simple date format
  if (from) {
    params.timeMin = new Date(`${from}T00:00:00`).toISOString();
  }

  if (to) {
    params.timeMax = new Date(`${to}T23:59:59`).toISOString();
  }

  const response = await axios.get(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    },
  );

  return {
    statusCode: 200,
    message: 'Events fetched successfully',
    events: response.data.items,
  };
}
  // New function to create an event
  // async createEvent(eventData: {
  //   attendees: any;
  //   summary: string;
  //   description?: string;
  //   start: string;
  //   end: string;
  // }) {
 async createEvent(eventData: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: { email: string }[];
}) {
  const accessToken = await this.googleService.getAccessToken();

  const response = await axios.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      summary: eventData.summary,
      description: eventData.description || '',

      start: {
        dateTime: eventData.start,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Asia/Kolkata',
      },

      attendees: eventData.attendees || [],

      // ✅ THIS IS THE KEY (Google Meet)
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // UNIQUE every time
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        conferenceDataVersion: 1, // ❗ MUST
        sendUpdates: 'all',
      },
    },
  );

  return {
    statusCode: 201,
    message: 'Event created with Google Meet',
    meetLink: response.data.hangoutLink, // ✅ THIS WILL COME
    event: response.data,
  };
}


  // CalendarService.ts
  async updateEvent(eventId: string, eventData: {
    summary?: string;
    description?: string;
    start?: string;
    end?: string;
  }) {
    const accessToken = await this.googleService.getAccessToken();

    const body: any = {};
    if (eventData.summary) body.summary = eventData.summary;
    if (eventData.description) body.description = eventData.description;
    if (eventData.start) body.start = { dateTime: eventData.start };
    if (eventData.end) body.end = { dateTime: eventData.end };

    const response = await axios.put(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      statusCode: 200,
      message: 'Event updated successfully',
      event: response.data,
    };
  }

  // CalendarService.ts
  async deleteEvent(eventId: string) {
    const accessToken = await this.googleService.getAccessToken();

    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      statusCode: 204,
      message: 'Event deleted successfully',
    };
  }

  async cancelEvent(eventId: string, cancelReason: string) {
    const accessToken = await this.googleService.getAccessToken();

    const response = await axios.patch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        status: 'cancelled',
        description: `❌ Event Cancelled\nReason: ${cancelReason}`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          sendUpdates: 'all',
        },
      },
    );

    return {
      statusCode: 200,
      message: 'Event cancelled successfully',
      eventId,
      cancelReason,
      meetLink:
        response.data.conferenceData?.entryPoints?.[0]?.uri || null,
    };
  }


}
