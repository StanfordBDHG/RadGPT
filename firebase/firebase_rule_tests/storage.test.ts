//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import crypto from "crypto";
import { beforeAll, describe, test } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteObject,
  getBytes,
  listAll,
  ref,
  uploadString,
} from "firebase/storage";

const PROJECT_ID = "demo-radgpt";

const db = await initializeTestEnvironment({ projectId: PROJECT_ID });

describe("Unauthenticated", () => {
  let testRef;
  beforeAll(async () => {
    const unauthenticatedDb = db.unauthenticatedContext().storage();
    testRef = ref(unauthenticatedDb, "/users/user1/reports/document");
  });
  test("Blocking Read/List Access", async () => {
    await assertFails(getBytes(testRef));
  });
  test("Blocking Write Access", async () => {
    await assertFails(uploadString(testRef, ""));
  });
});

describe("Authenticated Processed Annotations Access", () => {
  let user1;
  let user2;
  const uuid = crypto.randomUUID();
  beforeAll(async () => {
    user1 = db.authenticatedContext("user1").storage();
    user2 = db.authenticatedContext("user2").storage();
    await uploadString(
      ref(user1, `/users/user1/reports/${uuid}`),
      "test",
      "raw",
      {
        contentType: "text/plain",
      }
    );

    return async () => {
      await db.withSecurityRulesDisabled(async (context) => {
        await deleteObject(
          ref(context.storage(), `/users/user1/reports/${uuid}`)
        );
      });
    };
  });
  test("Test Allowed User1 Read Access", async () => {
    const documentRef = ref(user1, `/users/user1/reports/${uuid}`);
    const folderRef = ref(user1, "/users/user1/reports");
    await assertSucceeds(getBytes(documentRef));
    await assertSucceeds(listAll(folderRef));
  });
  test("Test Blocked User2 Read Access", async () => {
    const documentRef = ref(user2, `/users/user1/reports/${uuid}`);
    const folderRef = ref(user2, "/users/user1/reports");
    await assertFails(getBytes(documentRef));
    await assertFails(listAll(folderRef));
  });
  test("Test Allowed File Upload User 1", async () => {
    await assertFails(
      uploadString(ref(user1, `/users/user1/reports/${uuid}`), "test1", "raw", {
        contentType: "text/plain",
      })
    );
    await assertSucceeds(
      uploadString(
        ref(user1, `/users/user1/reports/${crypto.randomUUID()}`),
        "test1",
        "raw",
        {
          contentType: "text/plain",
        }
      )
    );
  });
  test("Test Blocked Overwrite through File Upload User 1", async () => {
    await assertFails(
      uploadString(ref(user1, `/users/user1/reports/${uuid}`), "test1", "raw", {
        contentType: "text/plain",
      })
    );
  });
  test("Test Allowed File Upload User 2", async () => {
    await assertFails(
      uploadString(
        ref(user2, `/users/user1/reports/${crypto.randomUUID()}`),
        "test1",
        "raw",
        {
          contentType: "text/plain",
        }
      )
    );
  });
});

describe("Authenticated Processed Annotations Deletion", () => {
  let user1;
  let user2;

  test("Test Blocked File Deletion", async () => {
    user1 = db.authenticatedContext("user1").storage();
    user2 = db.authenticatedContext("user2").storage();
    const uuid = crypto.randomUUID();
    await uploadString(
      ref(user1, `/users/user1/reports/${uuid}`),
      "test",
      "raw",
      {
        contentType: "text/plain",
      }
    );
    await assertFails(deleteObject(ref(user2, `/users/user1/reports/${uuid}`)));
    await assertSucceeds(
      deleteObject(ref(user1, `/users/user1/reports/${uuid}`))
    );
  });
});
