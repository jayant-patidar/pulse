// ============================================================
// User Types — ROOT Layer
// ============================================================
// Global identity. A user exists exactly once across the whole
// system. Users span organizations via Memberships.
// See: Doc 05 §4.1
// ============================================================

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;

  // Auth & Security
  isVerified: boolean;
  twoFactorEnabled: boolean;

  // OAuth Linking
  oauth?: {
    googleId?: string;
    microsoftId?: string;
    appleId?: string;
  };

  // Audit
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  loginCount: number;
  acceptedTermsVersion?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserPayload = Pick<User, 'email' | 'firstName' | 'lastName'> & {
  password: string;
  phone?: string;
};

export type UpdateUserPayload = Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatarUrl'>>;

export type UserSummary = Pick<User, '_id' | 'email' | 'firstName' | 'lastName' | 'avatarUrl'>;
