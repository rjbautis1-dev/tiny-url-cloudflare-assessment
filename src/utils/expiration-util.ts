import _ from "lodash";

export function hasExpired(expiresAt?: Date) {
    if (!_.isNil(expiresAt) && expiresAt.getTime() < Date.now()) {
        return true;
    }

    return false;
}