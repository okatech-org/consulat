/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_ai from "../functions/ai.js";
import type * as functions_analytics from "../functions/analytics.js";
import type * as functions_appointment from "../functions/appointment.js";
import type * as functions_associations from "../functions/associations.js";
import type * as functions_backgroundRemoval from "../functions/backgroundRemoval.js";
import type * as functions_childProfile from "../functions/childProfile.js";
import type * as functions_competences from "../functions/competences.js";
import type * as functions_country from "../functions/country.js";
import type * as functions_dbActions from "../functions/dbActions.js";
import type * as functions_document from "../functions/document.js";
import type * as functions_email from "../functions/email.js";
import type * as functions_feedback from "../functions/feedback.js";
import type * as functions_file from "../functions/file.js";
import type * as functions_geocoding from "../functions/geocoding.js";
import type * as functions_intelligence from "../functions/intelligence.js";
import type * as functions_membership from "../functions/membership.js";
import type * as functions_migration from "../functions/migration.js";
import type * as functions_networks from "../functions/networks.js";
import type * as functions_notification from "../functions/notification.js";
import type * as functions_organization from "../functions/organization.js";
import type * as functions_predictions from "../functions/predictions.js";
import type * as functions_profile from "../functions/profile.js";
import type * as functions_reports from "../functions/reports.js";
import type * as functions_request from "../functions/request.js";
import type * as functions_search from "../functions/search.js";
import type * as functions_service from "../functions/service.js";
import type * as functions_sms from "../functions/sms.js";
import type * as functions_ticket from "../functions/ticket.js";
import type * as functions_user from "../functions/user.js";
import type * as functions_workflow from "../functions/workflow.js";
import type * as helpers_relationships from "../helpers/relationships.js";
import type * as helpers_validation from "../helpers/validation.js";
import type * as http from "../http.js";
import type * as lib_ai_contextBuilder from "../lib/ai/contextBuilder.js";
import type * as lib_ai_documentHelpers from "../lib/ai/documentHelpers.js";
import type * as lib_ai_geminiAnalyzer from "../lib/ai/geminiAnalyzer.js";
import type * as lib_ai_knowledgeBase from "../lib/ai/knowledgeBase.js";
import type * as lib_ai_prompts from "../lib/ai/prompts.js";
import type * as lib_ai_types from "../lib/ai/types.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_countryCodes from "../lib/countryCodes.js";
import type * as lib_fileTypes from "../lib/fileTypes.js";
import type * as lib_legacyProfilesMap from "../lib/legacyProfilesMap.js";
import type * as lib_twilio from "../lib/twilio.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_utils from "../lib/utils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as storage from "../storage.js";
import type * as tables_appointments from "../tables/appointments.js";
import type * as tables_associations from "../tables/associations.js";
import type * as tables_childProfiles from "../tables/childProfiles.js";
import type * as tables_countries from "../tables/countries.js";
import type * as tables_documents from "../tables/documents.js";
import type * as tables_intelligenceNotes from "../tables/intelligenceNotes.js";
import type * as tables_memberships from "../tables/memberships.js";
import type * as tables_notifications from "../tables/notifications.js";
import type * as tables_organizations from "../tables/organizations.js";
import type * as tables_profiles from "../tables/profiles.js";
import type * as tables_requests from "../tables/requests.js";
import type * as tables_services from "../tables/services.js";
import type * as tables_tickets from "../tables/tickets.js";
import type * as tables_users from "../tables/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/ai": typeof functions_ai;
  "functions/analytics": typeof functions_analytics;
  "functions/appointment": typeof functions_appointment;
  "functions/associations": typeof functions_associations;
  "functions/backgroundRemoval": typeof functions_backgroundRemoval;
  "functions/childProfile": typeof functions_childProfile;
  "functions/competences": typeof functions_competences;
  "functions/country": typeof functions_country;
  "functions/dbActions": typeof functions_dbActions;
  "functions/document": typeof functions_document;
  "functions/email": typeof functions_email;
  "functions/feedback": typeof functions_feedback;
  "functions/file": typeof functions_file;
  "functions/geocoding": typeof functions_geocoding;
  "functions/intelligence": typeof functions_intelligence;
  "functions/membership": typeof functions_membership;
  "functions/migration": typeof functions_migration;
  "functions/networks": typeof functions_networks;
  "functions/notification": typeof functions_notification;
  "functions/organization": typeof functions_organization;
  "functions/predictions": typeof functions_predictions;
  "functions/profile": typeof functions_profile;
  "functions/reports": typeof functions_reports;
  "functions/request": typeof functions_request;
  "functions/search": typeof functions_search;
  "functions/service": typeof functions_service;
  "functions/sms": typeof functions_sms;
  "functions/ticket": typeof functions_ticket;
  "functions/user": typeof functions_user;
  "functions/workflow": typeof functions_workflow;
  "helpers/relationships": typeof helpers_relationships;
  "helpers/validation": typeof helpers_validation;
  http: typeof http;
  "lib/ai/contextBuilder": typeof lib_ai_contextBuilder;
  "lib/ai/documentHelpers": typeof lib_ai_documentHelpers;
  "lib/ai/geminiAnalyzer": typeof lib_ai_geminiAnalyzer;
  "lib/ai/knowledgeBase": typeof lib_ai_knowledgeBase;
  "lib/ai/prompts": typeof lib_ai_prompts;
  "lib/ai/types": typeof lib_ai_types;
  "lib/constants": typeof lib_constants;
  "lib/countryCodes": typeof lib_countryCodes;
  "lib/fileTypes": typeof lib_fileTypes;
  "lib/legacyProfilesMap": typeof lib_legacyProfilesMap;
  "lib/twilio": typeof lib_twilio;
  "lib/types": typeof lib_types;
  "lib/utils": typeof lib_utils;
  "lib/validators": typeof lib_validators;
  storage: typeof storage;
  "tables/appointments": typeof tables_appointments;
  "tables/associations": typeof tables_associations;
  "tables/childProfiles": typeof tables_childProfiles;
  "tables/countries": typeof tables_countries;
  "tables/documents": typeof tables_documents;
  "tables/intelligenceNotes": typeof tables_intelligenceNotes;
  "tables/memberships": typeof tables_memberships;
  "tables/notifications": typeof tables_notifications;
  "tables/organizations": typeof tables_organizations;
  "tables/profiles": typeof tables_profiles;
  "tables/requests": typeof tables_requests;
  "tables/services": typeof tables_services;
  "tables/tickets": typeof tables_tickets;
  "tables/users": typeof tables_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
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
