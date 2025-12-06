import { Track } from "../types";

export class Queue {
  private tracks: Track[] = [];

  public add(track: Track) {
    this.tracks.push(track);
  }

  public next(): Track | undefined {
    return this.tracks.shift();
  }

  public peek(): Track | undefined {
    return this.tracks[0];
  }

  public clear() {
    this.tracks = [];
  }

  public isEmpty(): boolean {
    return this.tracks.length === 0;
  }

  public getQueue(): Track[] {
    return [...this.tracks];
  }
}
