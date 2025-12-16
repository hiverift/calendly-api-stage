// src/meeting/dto/meeting.enums.ts
export enum CallType {
  PHONE_CALL = 'phone_call',
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  IN_PERSON = 'in_person',
}

export enum WhoCallsWho {
  HOST_CALLS_INVITEE = 'host_calls_invitee',
  INVITEE_CALLS_HOST = 'invitee_calls_host',
}
