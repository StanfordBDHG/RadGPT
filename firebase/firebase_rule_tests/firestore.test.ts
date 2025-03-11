//
// This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
//
// SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
//
// SPDX-License-Identifier: MIT
//

import { beforeAll, beforeEach, describe, test } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const PROJECT_ID = "demo-radgpt";

const db = await initializeTestEnvironment({ projectId: PROJECT_ID });

describe("Unauthenticated", () => {
  let testDoc;
  beforeAll(async () => {
    const unauthenticatedDb = db.unauthenticatedContext().firestore();
    testDoc = unauthenticatedDb
      .collection("users/user1/annotations")
      .doc("testAnnotation");
  });
  test("Blocking Read Access", async () => {
    await assertFails(testDoc.get());
  });
  test("Blocking Write Access", async () => {
    await assertFails(testDoc.set({}));
  });
});

describe("Authenticated Processed Annotations Access", () => {
  let user1;
  let user2;
  const fileContent = {
    processed_annotations: {},
    text_mapping: {},
    user_provided_text: {},
  };
  beforeEach(async () => {
    user1 = db.authenticatedContext("user1").firestore();
    user2 = db.authenticatedContext("user2").firestore();
    await db.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users/user1/annotations/testAnnotations"),
        fileContent
      );
    });

    return async () => {
      await db.withSecurityRulesDisabled(async (context) => {
        await deleteDoc(
          doc(context.firestore(), "users/user1/annotations/testAnnotations")
        );
      });
    };
  });
  test("Test Allowed User1 Read Access", async () => {
    await assertSucceeds(
      getDoc(doc(user1, "users/user1/annotations/testAnnotations"))
    );
  });
  test("Test Blocked User2 Read Access", async () => {
    await assertFails(
      getDoc(doc(user2, "users/user1/annotations/testAnnotations"))
    );
  });
  test("Test Blocked New File Creation", async () => {
    await assertFails(
      setDoc(doc(user1, "users/user1/annotations/newFile"), {})
    );
    await assertFails(
      setDoc(doc(user2, "users/user1/annotations/newFile"), {})
    );
  });
  test("Test Blocked File Deletion", async () => {
    await assertFails(
      deleteDoc(doc(user1, "users/user1/annotations/testAnnotations"))
    );
    await assertFails(
      deleteDoc(doc(user2, "users/user1/annotations/testAnnotations"))
    );
  });
  test("Test File Update", async () => {
    // Block Same Data
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
      })
    );
    await assertFails(
      updateDoc(doc(user2, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
      })
    );

    // Block Missing Fields
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {})
    );

    // Allow Same Data with Feedback
    await assertSucceeds(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
        user_feedback: "Test Feedback",
      })
    );

    // Block Same Data with Feedback from other user
    await assertFails(
      updateDoc(doc(user2, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
        user_feedback: "Test Feedback",
      })
    );

    // Block Same Data with modified data fields
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
        user_feedback: "Test Feedback",
        user_provided_test: "Different Text",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
        user_feedback: "Test Feedback",
        text_mapping: "Different Text Mapping",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/testAnnotations"), {
        ...fileContent,
        user_feedback: "Test Feedback",
        processed_annotations: "Different Processed Annotations",
      })
    );
  });
});

describe("Authenticated Cached Answer Access", () => {
  let user1;
  let user2;
  const fileContent = {
    main_explanation: "",
    concept_question_1: "",
    concept_answer_1: "",
    concept_question_2: "",
    concept_answer_2: "",
  };
  beforeEach(async () => {
    user1 = db.authenticatedContext("user1").firestore();
    user2 = db.authenticatedContext("user2").firestore();
    await db.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users/user1/annotations/cached_answer_1"),
        fileContent
      );
    });

    return async () => {
      await db.withSecurityRulesDisabled(async (context) => {
        await deleteDoc(
          doc(context.firestore(), "users/user1/annotations/cached_answer_1")
        );
      });
    };
  });
  test("Test Allowed User1 Read Access", async () => {
    await assertSucceeds(
      getDoc(doc(user1, "users/user1/annotations/cached_answer_1"))
    );
  });
  test("Test Blocked User2 Read Access", async () => {
    await assertFails(
      getDoc(doc(user2, "users/user1/annotations/cached_answer_1"))
    );
  });
  test("Test Blocked File Deletion", async () => {
    await assertFails(
      deleteDoc(doc(user1, "users/user1/annotations/cached_answer_1"))
    );
    await assertFails(
      deleteDoc(doc(user2, "users/user1/annotations/cached_answer_1"))
    );
  });
  test("Test File Update", async () => {
    // Block Same Data
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
      })
    );
    await assertFails(
      updateDoc(doc(user2, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
      })
    );

    // Block Missing Fields
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {})
    );

    // Allow Same Data with Feedback
    await assertSucceeds(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
      })
    );

    // Block Same Data with Feedback from other user
    await assertFails(
      updateDoc(doc(user2, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
      })
    );

    // Block Same Data with modified data fields
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
        main_explanation: "Main Explanation",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
        concept_question_1: "Question 1",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
        concept_answer_1: "Answer 1",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
        concept_question_2: "Question 2",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "users/user1/annotations/cached_answer_1"), {
        ...fileContent,
        feedback: {},
        concept_answer_2: "Answer 2",
      })
    );
  });
});
