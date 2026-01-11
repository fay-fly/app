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

export function getRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "1 day ago";
  }
  if (diffInDays < 7) {
    return `${diffInDays} day ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) {
    return "1 week ago";
  }
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }

  return getFormattedDate(date.toISOString());
}
