import { Twilio } from '@convex-dev/twilio';
import { components } from '../_generated/api';

export const twilio = new Twilio(components.twilio, {
  // optionally pass in the default "from" phone number you'll be using
  // this must be a phone number you've created with Twilio
  defaultFrom: process.env.TWILIO_PHONE_NUMBER!,
});
