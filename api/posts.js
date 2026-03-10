export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');

  const channels = [
    { id: 'traniorealestate', name: 'Tranio: недвижимость', flag: '🌍' },
    { id: 'traniodubai', name: 'Дубай от Tranio', flag: '🇦🇪' },
    { id: 'TranioThailand', name: 'Таиланд от Tranio', flag: '🇹🇭' },
    { id: 'TranioTurkey', name: 'Турция от Tranio', flag: '🇹🇷' },
    { id: 'GreeceTranio', name: 'Греция от Tranio', flag: '🇬🇷' },
    { id: 'TranioBali', name: 'Бали от Tranio', flag: '🇮🇩' },
    { id: 'TranioCyprus', name: 'Кипр от Tranio', flag: '🇨🇾' },
  ];

  try {
    const allPosts = [];

    await Promise.all(channels.map(async (ch) => {
      try {
        const resp = await fetch(`https://t.me/s/${ch.id}`);
        const html = await resp.text();

        // Extract messages
        const msgBlocks = html.split('tgme_widget_message_wrap').slice(1, 6); // last 5

        for (const block of msgBlocks) {
          // Extract message link
          const linkMatch = block.match(/data-post="([^"]+)"/);
          const link = linkMatch ? `https://t.me/${linkMatch[1]}` : '';

          // Extract text
          const textMatch = block.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
          let text = '';
          if (textMatch) {
            text = textMatch[1]
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .trim();
          }

          // Extract date
          const dateMatch = block.match(/datetime="([^"]+)"/);
          const date = dateMatch ? dateMatch[1] : '';

          // Extract views
          const viewsMatch = block.match(/tgme_widget_message_views[^>]*>([^<]+)/);
          const views = viewsMatch ? viewsMatch[1].trim() : '';

          if (text && text.length > 10) {
            allPosts.push({
              channel: ch.id,
              channelName: ch.name,
              flag: ch.flag,
              text: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
              date,
              views,
              link,
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch ${ch.id}:`, e.message);
      }
    }));

    // Sort by date descending
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return last 20 posts
    res.status(200).json({ posts: allPosts.slice(0, 20) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
