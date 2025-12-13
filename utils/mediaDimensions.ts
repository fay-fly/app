import type { PostMediaItem, UserWithPosts } from "@/types/postWithUser";

type HasMedia = {
  imageUrls: string[];
  media?: PostMediaItem[];
};

type Dimensions = {
  width: number;
  height: number;
};

const resolvedDimensions = new Map<string, Dimensions>();
const pendingDimensions = new Map<string, Promise<Dimensions>>();

const FALLBACK_DIMENSIONS: Dimensions = { width: 1, height: 1 };

const ensureValidDimensions = (dims: Dimensions): Dimensions => {
  if (dims.width > 0 && dims.height > 0) {
    return dims;
  }
  return FALLBACK_DIMENSIONS;
};

async function loadImageDimensions(url: string): Promise<Dimensions> {
  if (resolvedDimensions.has(url)) {
    return resolvedDimensions.get(url)!;
  }

  if (typeof window === "undefined") {
    return FALLBACK_DIMENSIONS;
  }

  if (pendingDimensions.has(url)) {
    return pendingDimensions.get(url)!;
  }

  const promise = new Promise<Dimensions>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.src = url;

    image.onload = () => {
      const dimensions = ensureValidDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      resolvedDimensions.set(url, dimensions);
      pendingDimensions.delete(url);
      resolve(dimensions);
    };

    image.onerror = () => {
      resolvedDimensions.set(url, FALLBACK_DIMENSIONS);
      pendingDimensions.delete(url);
      resolve(FALLBACK_DIMENSIONS);
    };
  });

  pendingDimensions.set(url, promise);
  return promise;
}

async function buildMediaItems(urls: string[]): Promise<PostMediaItem[]> {
  if (!urls || urls.length === 0) {
    return [];
  }

  const items = await Promise.all(
    urls.map(async (url) => {
      const { width, height } = await loadImageDimensions(url);
      return { url, width, height };
    })
  );

  return items;
}

export async function hydratePostMedia<T extends HasMedia>(
  post: T
): Promise<T & { media: PostMediaItem[] }> {
  if (post.media && post.media.length === post.imageUrls.length) {
    return post as T & { media: PostMediaItem[] };
  }

  const media = await buildMediaItems(post.imageUrls ?? []);
  return {
    ...post,
    media,
  };
}

export async function hydratePostsMedia<T extends HasMedia>(
  posts: T[]
): Promise<Array<T & { media: PostMediaItem[] }>> {
  return Promise.all(posts.map((post) => hydratePostMedia(post)));
}

export async function hydrateUserPostsMedia(
  user: UserWithPosts
): Promise<UserWithPosts> {
  const posts = await Promise.all(
    user.posts.map((post) => hydratePostMedia(post))
  );

  const pins = await Promise.all(
    user.pins.map(async (pin) => ({
      ...pin,
      post: await hydratePostMedia(pin.post),
    }))
  );

  return {
    ...user,
    posts,
    pins,
  };
}
