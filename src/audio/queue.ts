import { Song } from './search';

export class Queue {
  private songs: Song[] = [];

  public add(song: Song) {
    this.songs.push(song);
  }

  public next(): Song | undefined {
    return this.songs.shift();
  }

  public peek(): Song | undefined {
    return this.songs[0];
  }

  public clear() {
    this.songs = [];
  }

  public isEmpty(): boolean {
    return this.songs.length === 0;
  }

  public getQueue(): Song[] {
    return [...this.songs];
  }
}

