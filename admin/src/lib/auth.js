export const googleSignIn = async () => {
  return {
    displayName: "Admin Organizer",
    email: "admin@photopic.app",
    photoURL: null,
    uid: "mock-admin-id"
  };
};

export const emailSignIn = async (email, password) => {
  if (!email || !password) throw new Error("Email and password required");
  return {
    displayName: email.split('@')[0] || "Admin",
    email: email,
    photoURL: null,
    uid: "mock-admin-id"
  };
};
