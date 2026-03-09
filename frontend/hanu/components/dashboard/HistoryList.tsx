'use client'

export default function HistoryList() {
  const historyItems = [
    { text: 'Welcome to the future of voice...', time: '2m ago', dur: '0:14', voice: 'Arjun', date: 'Today' },
    { text: 'In this episode we explore...', time: '1h ago', dur: '0:32', voice: 'Priya', date: 'Today' },
    { text: 'Breaking news from the tech...', time: '3h ago', dur: '0:08', voice: 'Vikram', date: 'Yesterday' },
    { text: 'The art of storytelling begins...', time: '5h ago', dur: '0:21', voice: 'Maya', date: 'Yesterday' },
    { text: 'Meditation starts with breathing...', time: '1d ago', dur: '0:45', voice: 'Sahil', date: 'Mar 5' },
  ]

  return (
    <div className="history-section">
      <h4 className="history-title">Recent Generations</h4>
      <div className="history-list">
        {historyItems.map((item, i) => (
          <div key={i} className="history-card">
            <div className="history-card-top">
              <div className="history-play">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
              <div className="history-info">
                <div className="history-text">{item.text}</div>
                <div className="history-meta-row">
                  <span className="history-voice-tag">{item.voice}</span>
                  <span className="history-dur">{item.dur}</span>
                  <span className="history-date">{item.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
