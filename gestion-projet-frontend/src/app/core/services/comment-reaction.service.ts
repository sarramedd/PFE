import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentReaction, ReactionType } from 'src/app/shared/models/comment-reaction.model';

@Injectable({
  providedIn: 'root'
})
export class CommentReactionService {
  private readonly apiUrl = '/api/comment-reactions';

  constructor(private http: HttpClient) {}

  getByComment(commentId: number): Observable<CommentReaction[]> {
    return this.http.get<CommentReaction[]>(`${this.apiUrl}/${commentId}`);
  }

  add(commentId: number, type: ReactionType): Observable<CommentReaction> {
    return this.http.post<CommentReaction>(`${this.apiUrl}/${commentId}?type=${type}`, {});
  }

  remove(commentId: number, type: ReactionType): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}?type=${type}`);
  }
}
