import { useState } from 'react';
import { Music, Search, Loader2, Eye, EyeOff } from 'lucide-react';
import './App.css';

export default function AlbumTrackFinder() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracks = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    if (!artist.trim() || !album.trim()) {
      setError('Please enter both artist and album name');
      return;
    }

    setLoading(true);
    setError('');
    setTracks([]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a music database assistant.
                List the official tracklist for the studio album "${album}" by ${artist}.
                Requirements:
                - Use the original standard release (not deluxe, remastered, live, or bonus editions)
                - Preserve the correct track order
                - Provide ONLY the track names
                - One track per line
                - Number each track starting from 1
                - Do NOT include any commentary, years, or extra text
                If you are not confident in the exact official tracklist, reply exactly with:
                "I don't have information about this album."`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Gemini API. Please check your API key.');
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      if (text.includes("don't have information") || text.includes("don't know")) {
        setError('Album not found. Please check the artist and album name.');
      } else {
        const trackList = text
          .split('\n')
          .filter(line => line.trim())
          .map((line, index) => {
            const trimmedLine = line.trim();
            // Try to extract track number from the beginning of the line
            const match = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
            if (match) {
              return {
                number: parseInt(match[1], 10),
                name: match[2].trim()
              };
            } else {
              // If no number found, use index + 1 as fallback
              return {
                number: index + 1,
                name: trimmedLine
              };
            }
          })
          .filter(track => track.name.length > 0);
        
        setTracks(trackList);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchTracks();
    }
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Header Card */}
        <div className="header-card">
          <div className="header-content">
            <div className="icon-container">
              <Music />
            </div>
            <div className="title-section">
              <h1>Album Track Finder</h1>
              <p>Discover track listings instantly</p>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Gemini API Key
              </label>
              <div className="input-wrapper">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your Gemini API key"
                  className="form-input"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="toggle-button"
                  type="button"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <p className="help-text">
                Get your free API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., The Beatles"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Album Name
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Abbey Road"
                  className="form-input"
                />
              </div>
            </div>

            <button
              onClick={fetchTracks}
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search />
                  <span>Find Tracks</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="error-text">{error}</p>
            </div>
          </div>
        )}

        {/* Track List */}
        {tracks.length > 0 && (
          <div className="tracks-card">
            <div className="tracks-header">
              <h2 className="tracks-title">
                {album}
              </h2>
              <p className="tracks-artist">
                by {artist}
              </p>
              <p className="tracks-count">
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
            <div className="tracks-list">
              {tracks.map((track, index) => (
                <div
                  key={index}
                  className="track-item"
                >
                  <div className="track-number">
                    <span>{track.number}</span>
                  </div>
                  <span className="track-name">
                    {track.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}