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
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const PROJECT_ID = "demo-radgpt";

const db = await initializeTestEnvironment({ projectId: PROJECT_ID });

describe("Unauthenticated Annotations Access", () => {
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

describe("Unauthenticated User Issue Access", () => {
  let unauthenticatedUser;
  let existingDocRef;
  beforeAll(async () => {
    unauthenticatedUser = db.unauthenticatedContext().firestore();
    existingDocRef = doc(unauthenticatedUser, "user_reported_issue/newDoc");
    const issueContent = { test: "test" };

    db.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "user_reported_issue/newDoc"),
        issueContent
      );
    });
    return async () => {
      await db.withSecurityRulesDisabled(async (context) => {
        await deleteDoc(doc(context.firestore(), "user_reported_issue/newDoc"));
      });
    };
  });
  test("Blocking New File Read Access", async () => {
    await assertFails(getDoc(existingDocRef));
  });
  test("Blocking New File List Access", async () => {
    await assertFails(
      getDocs(collection(unauthenticatedUser, "user_reported_issues"))
    );
  });
  test("Blocking New File Write Access", async () => {
    await assertFails(
      setDoc(doc(unauthenticatedUser, "users_reported_issues/test"), {})
    );
  });
  test("Blocking New File Update Access", async () => {
    await assertFails(updateDoc(existingDocRef, {}));
  });
  test("Blocking New File Deletion Access", async () => {
    await assertFails(deleteDoc(existingDocRef));
  });
});

describe("Authenticated User Issue Access", () => {
  let user1;
  let user2;
  const issueContent = {
    pre_defined_issues: ["preIssue1", "preIssue2"],
    user_inputed_issue: "other",
    context: {},
  };
  beforeEach(async () => {
    user1 = db.authenticatedContext("user1").firestore();
    user2 = db.authenticatedContext("user2").firestore();
    await db.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "users_reported_issues/test"),
        issueContent
      );
    });
    return async () => {
      await db.withSecurityRulesDisabled(async (context) => {
        await deleteDoc(doc(context.firestore(), "users_reported_issues/test"));
      });
    };
  });

  test("Test Allowed User1 Create Access", async () => {
    await assertSucceeds(
      addDoc(collection(user1, "users_reported_issues"), {
        ...issueContent,
        user_id: "user1",
      })
    );
  });
  test("Test Block User2 Create Access with Other UID", async () => {
    await assertFails(
      addDoc(collection(user2, "users_reported_issues"), {
        ...issueContent,
        user_id: "user1",
      })
    );
  });
  test("Test Block Read Access", async () => {
    await assertFails(getDoc(doc(user1, "user_reported_issues/test")));
    await assertFails(getDoc(doc(user1, "user_reported_issues/test")));
  });
  test("Test Block List Access", async () => {
    await assertFails(getDocs(collection(user1, "users_reported_issues")));
    await assertFails(getDocs(collection(user2, "users_reported_issues")));
  });
  test("Test Block Update Access", async () => {
    await assertFails(
      updateDoc(doc(user1, "user_reported_issues/test"), {
        ...issueContent,
        user_id: "user1",
      })
    );
    await assertFails(
      updateDoc(doc(user1, "user_reported_issues/test"), {
        ...issueContent,
        user_id: "user2",
      })
    );
  });
  test("Test Block Delete Access", async () => {
    await assertFails(deleteDoc(doc(user1, "user_reported_issues/test")));
    await assertFails(deleteDoc(doc(user1, "user_reported_issues/test")));
  });
});
