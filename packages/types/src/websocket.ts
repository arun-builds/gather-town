export type ClientMessage =
    | {
          type: "join_room";
          roomId: string;
      }
    | {
          type: "leave_room";
      };

export type ServerErrorCode =
    | "INVALID_MESSAGE";

export type ServerMessage =
    | {
          type: "room_joined";
          roomId: string;
          players: PlayerState[];
      }
    | {
          type: "player_joined";
          player: PlayerState;
      }
    | {
          type: "player_left";
          userId: string;
      }
    | {
          type: "error";
          code: ServerErrorCode;
          message: string;
      };

export type PlayerState = {
    userId: string;
    position: {
        x: number;
        y: number;
    };
    direction: "up" | "down" | "left" | "right";
};