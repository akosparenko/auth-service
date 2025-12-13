import { Entity } from "./entity.js";
import { UserId } from "@auth/domain/value-objects/user-id.vo.js";

export class User extends Entity<UserId> {
    private constructor(
        id: UserId,
    ) {
        super();
        this.id = id;
    }


    static create(): User {
        const id = UserId.generate();
        return new User(id);
    }

    static reconstitute(id: string): User {
        const userId = UserId.create(id);
        return new User(userId);
    }
}
