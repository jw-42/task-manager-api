import { z } from "zod";

export const LaunchParamsSchema = z.object({
  sign: z.string(),
  vk_access_token_settings: z.string().optional(),
  vk_app_id: z.number(),
  vk_are_notifications_enabled: z.number().min(0).max(1).optional(),
  vk_chat_id: z.string().optional(),
  vk_group_id: z.number().optional(),
  vk_has_profile_button: z.number().min(0).max(1).optional(),
  vk_is_app_user: z.number().min(0).max(1).optional(),
  vk_is_favorite: z.number().min(0).max(1).optional(),
  vk_is_play_machine: z.number().min(0).max(1).optional(),
  vk_is_recommended: z.number().min(0).max(1).optional(),
  vk_is_widescreen: z.number().min(0).max(1).optional(),
  vk_language: z
    .enum(["ru", "uk", "ua", "en", "be", "kz", "pt", "es"])
    .optional(),
  vk_platform: z
    .enum([
      "desktop_web",
      "mobile_android",
      "mobile_ipad",
      "mobile_iphone",
      "mobile_web",
      "desktop_app_messenger",
      "desktop_web_messenger",
      "mobile_android_messenger",
      "mobile_iphone_messenger",
      "android_external",
      "iphone_external",
      "ipad_external",
      "mvk_external",
      "web_external",
    ])
    .optional(),
  vk_profile_id: z.number().optional(),
  vk_ref: z.string().optional(),
  vk_testing_group_id: z.number().optional(),
  vk_ts: z.number(),
  vk_user_id: z.number(),
  vk_viewer_group_role: z
    .enum(["admin", "editor", "member", "moder", "none"])
    .optional(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(32),
  short_name: z.string().min(2).max(16),
});