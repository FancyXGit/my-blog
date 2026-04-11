export interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	audioUrl: string;
	coverUrl: string;
	// LRC/TTML subtitle URL. APlayer will use this as lyric source.
	lyricsUrl?: string;
	// Optional inline LRC text fallback when remote URL cannot be read due CORS.
	lyrics?: string;
}

export const musicTracks: MusicTrack[] = [
	{
		id: "we-dont-talk-anymore",
		title: "We Don't Talk Anymore",
		artist: "Charlie Puth feat. Selena Gomez",
		audioUrl: "https://cdn.fancyflow.top/musics/we-dont-talk-anymore/we-dont-talk-anymore.mp3",
		coverUrl: "https://cdn.fancyflow.top/musics/we-dont-talk-anymore/we-dont-talk-anymore.webp",
		lyricsUrl: "https://cdn.fancyflow.top/musics/we-dont-talk-anymore/we-dont-talk-anymore.lrc",
    },
    {
        id: "you-are-not-alone",
        title: "You Are Not Alone",
        artist: "Michael Jackson",
        audioUrl: "https://cdn.fancyflow.top/musics/you-are-not-alone/you-are-not-alone.mp3",
        coverUrl: "https://cdn.fancyflow.top/musics/you-are-not-alone/you-are-not-alone.webp",
        lyricsUrl: "https://cdn.fancyflow.top/musics/you-are-not-alone/you-are-not-alone.lrc",
    },
    {
        "id":"move-like-jagger",
        "title":"Moves Like Jagger",
        "artist": "Maroon 5 feat. Christina Aguilera",
        "audioUrl":"https://cdn.fancyflow.top/musics/move-like-jagger/move-like-jagger.mp3",
        "coverUrl":"https://cdn.fancyflow.top/musics/move-like-jagger/move-like-jagger.webp",
        "lyricsUrl":"https://cdn.fancyflow.top/musics/move-like-jagger/move-like-jagger.lrc",
    }
];
