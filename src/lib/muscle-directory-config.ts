import { z } from "zod";

export const DIRECTORY_REGIONS = ["head-neck", "shoulder-arm", "spine-rib-cage", "pelvis-hip", "knee", "foot-ankle"] as const;
export const DIRECTORY_REGION_LABELS = ["Head & Neck", "Shoulder & Arm", "Spine & Rib Cage", "Hip & Pelvis", "Knee", "Ankle & Foot"];
export const DIRECTORY_FUNCTIONS = ["Neck flexor","Neck extensor","Neck lateral flexor","Neck rotator","Shoulder flexor","Shoulder extensor","Shoulder abductor","Shoulder adductor","Shoulder internal rotator","Shoulder external rotator","Scapular protractor","Scapular retractor","Scapular elevator","Scapular depressor","Scapular upward rotator","Scapular downward rotator","Elbow flexor","Elbow extensor","Forearm pronator","Forearm supinator","Wrist flexor","Wrist extensor","Finger flexor","Finger extensor","Finger abductor","Finger adductor","Thumb flexor","Thumb extensor","Thumb abductor","Thumb adductor","Thumb opposer","Trunk flexor","Trunk extensor","Trunk rotator","Trunk lateral flexor","Inspiratory muscle","Expiratory muscle","Pelvic floor supporter","Urinary continence muscle","Fecal continence muscle","Hip flexor","Hip extensor","Hip abductor","Hip adductor","Hip internal rotator","Hip external rotator","Knee flexor","Knee extensor","Knee internal rotator","Knee external rotator","Ankle dorsiflexor","Ankle plantarflexor","Foot invertor","Foot evertor","Toe flexor","Toe extensor"] as const;
export const directoryConfigSchema = z.object({
  regions: z.array(z.enum(DIRECTORY_REGIONS)).min(1).max(6).nullable(),
  groups: z.array(z.string().trim().min(1).max(80)).min(1).max(20).nullable(),
  functions: z.array(z.enum(DIRECTORY_FUNCTIONS)).max(60).nullable(),
});
export type DirectoryConfig = z.infer<typeof directoryConfigSchema>;
export const AUTO_DIRECTORY_CONFIG: DirectoryConfig = { regions: null, groups: null, functions: null };
