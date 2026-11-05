/** Journal routes share this component: /stories lists entries; /stories/:id opens one.
 * Story text, illustrations, and stable route IDs are authored in data/catalog.ts.
 */
import { Link, useParams } from 'react-router-dom';
import { stories } from '../data/catalog';

/** Select the journal index or an individual editorial from the optional route parameter. */
export default function StoriesPage() {
  const { id } = useParams();
  if (id) {
    // A missing article keeps its recovery link inside the journal instead of failing the route.
    const story = stories.find((candidate) => candidate.id === id);
    if (!story) return <div className="form-panel"><div className="page-heading"><h1>This story is missing.</h1><p>There are more chapters waiting in the journal.</p></div><Link className="btn" to="/stories">Back to stories ↗</Link></div>;
    return <article className="article"><Link to="/stories" className="eyebrow">← The journal / {story.kicker}</Link><h1>{story.title}</h1><p>{story.summary}</p><img src={story.image} alt={`Illustrative fashion photograph for ${story.title}`} /><p className="notice">Sample editorial · Style context, not a provenance claim</p>{story.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<h2>The past is a starting point.</h2><p>Find a familiar silhouette. Make it part of your own story.</p><Link className="btn red" to="/vault">Explore the collection ↗</Link></article>;
  }
  // With no ID, preserve the authored story order for the journal index.
  return <><div className="page-heading"><div className="eyebrow">The journal</div><h1>Stories worth wearing.</h1><p>A little history. A fresh perspective. Explore the moods and ideas behind a wardrobe with character.</p></div>{stories.map((story) => <section className="details" key={story.id}><img src={story.image} alt={`Illustrative fashion photograph for ${story.title}`} loading="lazy" /><div><div className="eyebrow">{story.kicker}</div><h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', margin: '20px 0' }}>{story.title}</h2><p>{story.summary}</p><Link className="btn light" to={`/stories/${story.id}`}>Read the story <span aria-hidden="true">↗</span></Link><p className="notice">Sample editorial · Illustrative photography</p></div></section>)}</>;
}
