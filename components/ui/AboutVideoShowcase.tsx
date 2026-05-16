import { videoStories } from "@/data/about";

interface VideoStory {
  id: string;
  videoSrc?: string;
  poster?: string;
  initials?: string;
  topic: string;
  duration: string;
  title: string;
  summary: string;
  name: string;
  role: string;
}

function StoryMedia({ story }: { story: VideoStory }) {
  if (story.videoSrc) {
    return (
      <video
        className="story-video"
        src={story.videoSrc}
        poster={story.poster || undefined}
        controls
        preload="metadata"
      />
    );
  }

  return (
    <div className="story-poster" aria-label={`${story.title} video preview`}>
      <div className="story-initials">{story.initials}</div>
      <div className="story-play" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function VideoStoryCard({ story, index }: { story: VideoStory; index: number }) {
  return (
    <article className="video-story reveal">
      <div className="story-index mono">{String(index + 1).padStart(2, "0")}</div>
      <StoryMedia story={story} />
      <div className="story-copy">
        <div className="story-meta">
          <span>{story.topic}</span>
          <span>{story.duration}</span>
        </div>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        <div className="story-person">
          <span className="name">{story.name}</span>
          <span className="role">{story.role}</span>
        </div>
      </div>
    </article>
  );
}

export function AboutVideoShowcase({ stories = videoStories }: { stories?: VideoStory[] }) {
  return (
    <section className="about-videos" aria-labelledby="about-videos-title">
      <div className="wrap">
        <header className="about-section-head reveal">
          <div className="eyebrow">Team stories</div>
          <div>
            <h2 id="about-videos-title">
              Voices from <span className="serif-i">Estate Brothers.</span>
            </h2>
            <p>
              A dedicated place for team videos, success stories, and role-based introductions as
              the company profile grows.
            </p>
          </div>
        </header>

        <div className="video-story-grid">
          {stories.map((story, index) => (
            <VideoStoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
