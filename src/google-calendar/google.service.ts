
import axios from 'axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class GoogleService {
  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(' Google Token Error:', error.response?.data);
      throw new InternalServerErrorException(
        'Failed to generate Google access token',
      );
    }
  }
}
