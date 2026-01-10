import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GoogleService } from './google.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CalendarService {
  constructor(private googleService: GoogleService, private userService: UserService,) { }

  async getBusySlots(userId?: string, from?: string, to?: string) {
    try {
      const accessToken = await this.googleService.getAccessToken();

      const response = await axios.post(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        {
          timeMin: new Date(from!).toISOString(),
          timeMax: new Date(to!).toISOString(),
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
    } catch (error) {
      if (error.response?.status === 401&& userId) {
        await this.userService.update(userId, {
          isGoogleCalendarActive: false,
        });
      }
      throw error;
    }
  }
  async getEvents(userId?: string, from?: string, to?: string) {
    try {
      const accessToken = await this.googleService.getAccessToken();

      const params: any = {
        singleEvents: true,
        orderBy: 'startTime',
      };

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

    } catch (error) {

      // ✅ ONLY ADDITION
      if (error.response?.status === 401&& userId) {
        await this.userService.update(userId, {
          isGoogleCalendarActive: false,
        });
      }

      throw error;
    }
  }
  async createEvent(eventData: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    attendees?: { email: string }[];
  },
     timezone = 'Asia/Kolkata',
  ) {
    try {
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
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
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
            conferenceDataVersion: 1,
            sendUpdates: 'all',
          },
        },
      );

      return {
        statusCode: 201,
        message: 'Event created with Google Meet',
        meetLink: response.data.hangoutLink,
        event: response.data,
      };
    }catch (error) {
      if (error.response?.status === 401) {
        // intentionally empty (no userId here)
      }
      throw error;
    }
  }



  async updateEvent(
    eventId: string,
    eventData: {
      summary?: string;
      description?: string;
      start?: string;
      end?: string;
    },
     timezone = 'Asia/Kolkata',
  ) {
    try {
      const accessToken = await this.googleService.getAccessToken();

      const existingEvent = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const attendees = existingEvent.data.attendees || [];

      const body: any = { attendees };

      if (eventData.summary) body.summary = eventData.summary;
      if (eventData.description) body.description = eventData.description;
      if (eventData.start)
        body.start = { dateTime: eventData.start, timeZone: 'Asia/Kolkata' };
      if (eventData.end)
        body.end = { dateTime: eventData.end, timeZone: 'Asia/Kolkata' };

      const response = await axios.patch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: { sendUpdates: 'all' },
        },
      );

      return {
        statusCode: 200,
        message: 'Event updated successfully (emails sent)',
        event: response.data,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        // intentionally empty
      }
      throw error;
    }
  }

  // CalendarService.ts

  async deleteEvent(eventId: string) {
    try {
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
    } catch (error) {
      if (error.response?.status === 401) {
       
      }
      throw error;
    }
  }

  async cancelEvent(eventId: string, cancelReason: string) {
    try {
      const accessToken = await this.googleService.getAccessToken();

      const response = await axios.patch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          status: 'cancelled',
          description: ` Event Cancelled\nReason: ${cancelReason}`,
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
    } catch (error) {
      if (error.response?.status === 401) {
      
      }
      throw error;
    }
  }

}
