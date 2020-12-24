import datetime
import json
from pathlib import Path
from pprint import pprint
from collections import Counter, namedtuple
from dateutil.parser import parse as parse_date

history_path = Path(__file__).parent / 'data' / 'Takeout' / 'YouTube and YouTube Music' / 'history' / 'watch-history.json'
data = json.load(history_path.open())

# What do a few entries look like?
pprint(data[:5])

event_types = [event['title'].split()[0] for event in data]
print()
print('Event types:')
pprint(Counter(event_types))

event_headers = [event['header'] for event in data]
print()
print('Event headers:')
pprint(Counter(event_headers))

# There are two 'header' values: 'YouTube' and 'YouTube Music'
# How are the listens distributed?
print()
print('So how many listens per month?')
ytm_data = [event for event in data if event['header'] == 'YouTube Music']
listen_times = [parse_date(event['time']) for event in ytm_data]
pprint(sorted(Counter(f'{t.year}-{t.month:02d}' for t in listen_times).items()))

# What else is in the YouTube Music-specific data?
print()
pprint(ytm_data[:5])

# It looks like I can get the song titles from the 'title' and the artist from the 'name' subtitle.
# Are there any events without expected titles?
title_prefix = 'Watched '
artist_suffix = ' - Topic'

ytm_data_no_exp_title = [event for event in ytm_data if not event['title'].startswith(title_prefix)]
print()
print('Unexpectedly titled YTM events:')
pprint(ytm_data_no_exp_title[:5])

# Is there always just one subtitle?
ytm_data_multiple_subtitles = [event for event in ytm_data if len(event.get('subtitles', [])) > 1]
print()
print(f'YTM events with multiple subtitles: {len(ytm_data_multiple_subtitles)} of {len(ytm_data)}')
pprint(ytm_data_multiple_subtitles[:5])

ytm_data_no_subtitles = [event for event in ytm_data if len(event.get('subtitles', [])) < 1]
print()
print(f'YTM events with no subtitles: {len(ytm_data_no_subtitles)} of {len(ytm_data)}')
pprint(ytm_data_no_subtitles[:5])

# So, none have more than one subtitle (for now), and the ones that have no subtitles have no song title (in the data).
Song = namedtuple('Song', ['title', 'artist', 'url'])

def extract_title(event):
    return event['title'][len(title_prefix):]

def extract_artist(event):
    for subtitle in event.get('subtitles', []):
        if subtitle['name'].endswith(artist_suffix):
            return subtitle['name'][:-len(artist_suffix)]

def extract_url(event):
    return event.get('titleUrl')

songs = [Song(
            title=extract_title(event),
            artist=extract_artist(event),
            url=extract_url(event),
        ) for event in ytm_data]

# What are the most frequent songs and artists?
song_counts = Counter(f'{song.title}   -   {song.artist}' for song in songs)
artist_counts = Counter(song.artist for song in songs if song.artist)

print()
print('Most common songs:')
pprint(song_counts.most_common(20))

print()
print('Most common artists:')
pprint(artist_counts.most_common(20))

# print
