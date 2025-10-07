/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_analytics_getAnalytics from "../functions/analytics/getAnalytics.js";
import type * as functions_appointments_createAppointment from "../functions/appointments/createAppointment.js";
import type * as functions_appointments_getAppointment from "../functions/appointments/getAppointment.js";
import type * as functions_appointments_updateAppointment from "../functions/appointments/updateAppointment.js";
import type * as functions_countries_countryManagement from "../functions/countries/countryManagement.js";
import type * as functions_documents_createDocument from "../functions/documents/createDocument.js";
import type * as functions_documents_getDocument from "../functions/documents/getDocument.js";
import type * as functions_documents_updateDocument from "../functions/documents/updateDocument.js";
import type * as functions_files_documentFileManagement from "../functions/files/documentFileManagement.js";
import type * as functions_files_fileStorage from "../functions/files/fileStorage.js";
import type * as functions_files_fileValidation from "../functions/files/fileValidation.js";
import type * as functions_helpers_advancedHelpers from "../functions/helpers/advancedHelpers.js";
import type * as functions_memberships_membershipManagement from "../functions/memberships/membershipManagement.js";
import type * as functions_migration_importData from "../functions/migration/importData.js";
import type * as functions_notifications_createNotification from "../functions/notifications/createNotification.js";
import type * as functions_notifications_getNotification from "../functions/notifications/getNotification.js";
import type * as functions_notifications_updateNotification from "../functions/notifications/updateNotification.js";
import type * as functions_organizations_createOrganization from "../functions/organizations/createOrganization.js";
import type * as functions_organizations_getOrganization from "../functions/organizations/getOrganization.js";
import type * as functions_organizations_getOrganizationServices from "../functions/organizations/getOrganizationServices.js";
import type * as functions_organizations_organizationCountryConfig from "../functions/organizations/organizationCountryConfig.js";
import type * as functions_organizations_updateOrganization from "../functions/organizations/updateOrganization.js";
import type * as functions_profiles_createProfile from "../functions/profiles/createProfile.js";
import type * as functions_profiles_getProfile from "../functions/profiles/getProfile.js";
import type * as functions_profiles_updateProfile from "../functions/profiles/updateProfile.js";
import type * as functions_requests_createRequest from "../functions/requests/createRequest.js";
import type * as functions_requests_getRequest from "../functions/requests/getRequest.js";
import type * as functions_requests_getUserRequests from "../functions/requests/getUserRequests.js";
import type * as functions_requests_updateRequest from "../functions/requests/updateRequest.js";
import type * as functions_search_globalSearch from "../functions/search/globalSearch.js";
import type * as functions_sendEmails from "../functions/sendEmails.js";
import type * as functions_sendSms from "../functions/sendSms.js";
import type * as functions_services_createService from "../functions/services/createService.js";
import type * as functions_services_getService from "../functions/services/getService.js";
import type * as functions_services_updateService from "../functions/services/updateService.js";
import type * as functions_tickets_createTicket from "../functions/tickets/createTicket.js";
import type * as functions_tickets_getTicket from "../functions/tickets/getTicket.js";
import type * as functions_tickets_updateTicket from "../functions/tickets/updateTicket.js";
import type * as functions_users_createUser from "../functions/users/createUser.js";
import type * as functions_users_deleteUser from "../functions/users/deleteUser.js";
import type * as functions_users_getUser from "../functions/users/getUser.js";
import type * as functions_users_getUserProfile from "../functions/users/getUserProfile.js";
import type * as functions_users_handleNewUser from "../functions/users/handleNewUser.js";
import type * as functions_users_updateOrCreateUser from "../functions/users/updateOrCreateUser.js";
import type * as functions_users_updateUser from "../functions/users/updateUser.js";
import type * as functions_workflow_workflowManagement from "../functions/workflow/workflowManagement.js";
import type * as helpers_migration from "../helpers/migration.js";
import type * as helpers_pagination from "../helpers/pagination.js";
import type * as helpers_relationships from "../helpers/relationships.js";
import type * as helpers_validation from "../helpers/validation.js";
import type * as http from "../http.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_countries from "../lib/countries.js";
import type * as lib_fileTypes from "../lib/fileTypes.js";
import type * as lib_twilio from "../lib/twilio.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as storage from "../storage.js";
import type * as tables_appointments from "../tables/appointments.js";
import type * as tables_countries from "../tables/countries.js";
import type * as tables_documents from "../tables/documents.js";
import type * as tables_memberships from "../tables/memberships.js";
import type * as tables_notifications from "../tables/notifications.js";
import type * as tables_organizationCountryConfigs from "../tables/organizationCountryConfigs.js";
import type * as tables_organizations from "../tables/organizations.js";
import type * as tables_profiles from "../tables/profiles.js";
import type * as tables_requests from "../tables/requests.js";
import type * as tables_services from "../tables/services.js";
import type * as tables_tickets from "../tables/tickets.js";
import type * as tables_users from "../tables/users.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/analytics/getAnalytics": typeof functions_analytics_getAnalytics;
  "functions/appointments/createAppointment": typeof functions_appointments_createAppointment;
  "functions/appointments/getAppointment": typeof functions_appointments_getAppointment;
  "functions/appointments/updateAppointment": typeof functions_appointments_updateAppointment;
  "functions/countries/countryManagement": typeof functions_countries_countryManagement;
  "functions/documents/createDocument": typeof functions_documents_createDocument;
  "functions/documents/getDocument": typeof functions_documents_getDocument;
  "functions/documents/updateDocument": typeof functions_documents_updateDocument;
  "functions/files/documentFileManagement": typeof functions_files_documentFileManagement;
  "functions/files/fileStorage": typeof functions_files_fileStorage;
  "functions/files/fileValidation": typeof functions_files_fileValidation;
  "functions/helpers/advancedHelpers": typeof functions_helpers_advancedHelpers;
  "functions/memberships/membershipManagement": typeof functions_memberships_membershipManagement;
  "functions/migration/importData": typeof functions_migration_importData;
  "functions/notifications/createNotification": typeof functions_notifications_createNotification;
  "functions/notifications/getNotification": typeof functions_notifications_getNotification;
  "functions/notifications/updateNotification": typeof functions_notifications_updateNotification;
  "functions/organizations/createOrganization": typeof functions_organizations_createOrganization;
  "functions/organizations/getOrganization": typeof functions_organizations_getOrganization;
  "functions/organizations/getOrganizationServices": typeof functions_organizations_getOrganizationServices;
  "functions/organizations/organizationCountryConfig": typeof functions_organizations_organizationCountryConfig;
  "functions/organizations/updateOrganization": typeof functions_organizations_updateOrganization;
  "functions/profiles/createProfile": typeof functions_profiles_createProfile;
  "functions/profiles/getProfile": typeof functions_profiles_getProfile;
  "functions/profiles/updateProfile": typeof functions_profiles_updateProfile;
  "functions/requests/createRequest": typeof functions_requests_createRequest;
  "functions/requests/getRequest": typeof functions_requests_getRequest;
  "functions/requests/getUserRequests": typeof functions_requests_getUserRequests;
  "functions/requests/updateRequest": typeof functions_requests_updateRequest;
  "functions/search/globalSearch": typeof functions_search_globalSearch;
  "functions/sendEmails": typeof functions_sendEmails;
  "functions/sendSms": typeof functions_sendSms;
  "functions/services/createService": typeof functions_services_createService;
  "functions/services/getService": typeof functions_services_getService;
  "functions/services/updateService": typeof functions_services_updateService;
  "functions/tickets/createTicket": typeof functions_tickets_createTicket;
  "functions/tickets/getTicket": typeof functions_tickets_getTicket;
  "functions/tickets/updateTicket": typeof functions_tickets_updateTicket;
  "functions/users/createUser": typeof functions_users_createUser;
  "functions/users/deleteUser": typeof functions_users_deleteUser;
  "functions/users/getUser": typeof functions_users_getUser;
  "functions/users/getUserProfile": typeof functions_users_getUserProfile;
  "functions/users/handleNewUser": typeof functions_users_handleNewUser;
  "functions/users/updateOrCreateUser": typeof functions_users_updateOrCreateUser;
  "functions/users/updateUser": typeof functions_users_updateUser;
  "functions/workflow/workflowManagement": typeof functions_workflow_workflowManagement;
  "helpers/migration": typeof helpers_migration;
  "helpers/pagination": typeof helpers_pagination;
  "helpers/relationships": typeof helpers_relationships;
  "helpers/validation": typeof helpers_validation;
  http: typeof http;
  "lib/constants": typeof lib_constants;
  "lib/countries": typeof lib_countries;
  "lib/fileTypes": typeof lib_fileTypes;
  "lib/twilio": typeof lib_twilio;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  storage: typeof storage;
  "tables/appointments": typeof tables_appointments;
  "tables/countries": typeof tables_countries;
  "tables/documents": typeof tables_documents;
  "tables/memberships": typeof tables_memberships;
  "tables/notifications": typeof tables_notifications;
  "tables/organizationCountryConfigs": typeof tables_organizationCountryConfigs;
  "tables/organizations": typeof tables_organizations;
  "tables/profiles": typeof tables_profiles;
  "tables/requests": typeof tables_requests;
  "tables/services": typeof tables_services;
  "tables/tickets": typeof tables_tickets;
  "tables/users": typeof tables_users;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          createdAt: number;
          errorMessage?: string;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject: string;
          text?: string;
          to: string;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          complained: boolean;
          errorMessage: string | null;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject: string;
          text?: string;
          to: string;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
  twilio: {
    messages: {
      create: FunctionReference<
        "action",
        "internal",
        {
          account_sid: string;
          auth_token: string;
          body: string;
          callback?: string;
          from: string;
          status_callback: string;
          to: string;
        },
        {
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }
      >;
      getByCounterparty: FunctionReference<
        "query",
        "internal",
        { account_sid: string; counterparty: string; limit?: number },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      getBySid: FunctionReference<
        "query",
        "internal",
        { account_sid: string; sid: string },
        {
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        } | null
      >;
      getFrom: FunctionReference<
        "query",
        "internal",
        { account_sid: string; from: string; limit?: number },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      getFromTwilioBySidAndInsert: FunctionReference<
        "action",
        "internal",
        {
          account_sid: string;
          auth_token: string;
          incomingMessageCallback?: string;
          sid: string;
        },
        {
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }
      >;
      getTo: FunctionReference<
        "query",
        "internal",
        { account_sid: string; limit?: number; to: string },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      list: FunctionReference<
        "query",
        "internal",
        { account_sid: string; limit?: number },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      listIncoming: FunctionReference<
        "query",
        "internal",
        { account_sid: string; limit?: number },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      listOutgoing: FunctionReference<
        "query",
        "internal",
        { account_sid: string; limit?: number },
        Array<{
          account_sid: string;
          api_version: string;
          body: string;
          counterparty?: string;
          date_created: string;
          date_sent: string | null;
          date_updated: string | null;
          direction: string;
          error_code: number | null;
          error_message: string | null;
          from: string;
          messaging_service_sid: string | null;
          num_media: string;
          num_segments: string;
          price: string | null;
          price_unit: string | null;
          rest?: any;
          sid: string;
          status: string;
          subresource_uris: { feedback?: string; media: string } | null;
          to: string;
          uri: string;
        }>
      >;
      updateStatus: FunctionReference<
        "mutation",
        "internal",
        { account_sid: string; sid: string; status: string },
        null
      >;
    };
    phone_numbers: {
      create: FunctionReference<
        "action",
        "internal",
        { account_sid: string; auth_token: string; number: string },
        any
      >;
      updateSmsUrl: FunctionReference<
        "action",
        "internal",
        {
          account_sid: string;
          auth_token: string;
          sid: string;
          sms_url: string;
        },
        any
      >;
    };
  };
};
