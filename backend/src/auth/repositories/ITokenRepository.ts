export interface ITokenRepository {
    
  save(token: string, userId: string): Promise<void>;

  getUserId(token: string): Promise<string | null>;
}
