export function getAgeFromDob(dob: string | Date): number {
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const isBeforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (isBeforeBirthday) {
    age--;
  }
  return age;
}

export function getFormattedDate(dateString: string) {
  const date = new Date(dateString);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: userTimeZone,
  });
}
