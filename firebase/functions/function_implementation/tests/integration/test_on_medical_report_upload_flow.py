#
# This source file is part of the Stanford Biodesign Digital Health RadGPT open-source project
#
# SPDX-FileCopyrightText: 2024 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

import json
import pathlib

import pytest
from function_implementation.on_medical_report_upload import (
    on_medical_report_upload_impl,
)


@pytest.mark.timeout(60)
def test_full_upload_flow(mocker):
    bucket = "<bucket>"
    uid = "<uid>"
    report_hash = "<report_hash>"
    user_provided_report = """Study Type: CT Abdomen and Pelvis
Indication: Evaluation for kidney stones due to symptoms of flank pain and hematuria.

Findings:

The kidneys appear normal in size, shape, and position. There is no evidence of hydronephrosis, masses, or calcifications within either kidney. The renal parenchyma and collecting systems are within normal limits. No signs of renal calculi or obstruction in either ureter.

In the urinary bladder, a small, non-obstructing calculus is visualized measuring approximately [size in mm]. The calculus is located in the lower portion of the bladder and is not causing any noticeable obstruction or irritation of the bladder wall.

Impression:

Small non-obstructing bladder calculus without evidence of associated hydronephrosis or renal calculi. The stone appears benign, and no immediate intervention is necessary.
No other abnormalities detected in the kidneys or urinary tract."""
    mock_event = mocker.MagicMock()
    mock_event.data.name = f"users/{uid}/reports/{report_hash}"
    mock_event.data.bucket = bucket

    mocked_get_report_from_cloud_storage_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__get_report_from_cloud_storage",
        return_value=user_provided_report,
    )

    mocked_set_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__set_report_meta_data",
    )

    mocked_update_report_meta_data_function = mocker.patch(
        "function_implementation.on_medical_report_upload.__update_report_meta_data",
    )

    on_medical_report_upload_impl(mock_event)

    mocked_get_report_from_cloud_storage_function.assert_called_once_with(
        bucket, pathlib.PurePath(mock_event.data.name)
    )

    mocked_set_report_meta_data_function.assert_called_once_with(
        uid,
        report_hash,
        {
            "user_provided_text": user_provided_report,
        },
    )

    expected_processed_annotation = """[{"observation": "normal", "observation_start_ix": [27], "located_at": ["size", "shape", "position"], "located_at_start_ix": [[29], [31], [34]], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [27], "located_at_end_ix": [[29], [31], [34]]}, {"observation": "hydronephrosis", "observation_start_ix": [41], "located_at": ["kidney"], "located_at_start_ix": [[49]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [41], "located_at_end_ix": [[49]]}, {"observation": "masses", "observation_start_ix": [43], "located_at": ["kidney"], "located_at_start_ix": [[49]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [43], "located_at_end_ix": [[49]]}, {"observation": "calcifications", "observation_start_ix": [46], "located_at": ["kidney"], "located_at_start_ix": [[49]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [46], "located_at_end_ix": [[49]]}, {"observation": "normal", "observation_start_ix": [59], "located_at": ["renal parenchyma collecting systems", "parenchyma", "collecting systems"], "located_at_start_ix": [[52, 53, 55], [53], [55]], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [59], "located_at_end_ix": [[52, 53, 56], [53], [56]]}, {"observation": "calculi", "observation_start_ix": [66], "located_at": ["renal"], "located_at_start_ix": [[65]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [66], "located_at_end_ix": [[65]]}, {"observation": "obstruction", "observation_start_ix": [68], "located_at": ["ureter"], "located_at_start_ix": [[71]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [68], "located_at_end_ix": [[71]]}, {"observation": "small non - obstructing calculus", "observation_start_ix": [79, 81, 84], "located_at": ["urinary bladder"], "located_at_start_ix": [[75, 76]], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [79, 83, 84], "located_at_end_ix": [[75, 76]]}, {"observation": "calculus", "observation_start_ix": [95], "located_at": ["bladder"], "located_at_start_ix": [[104]], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [95], "located_at_end_ix": [[104]]}, {"observation": "obstruction", "observation_start_ix": [111], "located_at": [], "located_at_start_ix": [], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [111], "located_at_end_ix": []}, {"observation": "irritation", "observation_start_ix": [113], "located_at": ["wall"], "located_at_start_ix": [[117]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [113], "located_at_end_ix": [[117]]}, {"observation": "small non - obstructing calculus", "observation_start_ix": [121, 122, 126], "located_at": ["bladder"], "located_at_start_ix": [[125]], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [121, 124, 126], "located_at_end_ix": [[125]]}, {"observation": "hydronephrosis", "observation_start_ix": [131], "located_at": [], "located_at_start_ix": [], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [131], "located_at_end_ix": []}, {"observation": "calculi", "observation_start_ix": [134], "located_at": ["renal"], "located_at_start_ix": [[133]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [134], "located_at_end_ix": [[133]]}, {"observation": "stone benign", "observation_start_ix": [137, 139], "located_at": [], "located_at_start_ix": [], "tags": ["definitely present"], "suggestive_of": null, "observation_end_ix": [137, 139], "located_at_end_ix": []}, {"observation": "immediate intervention", "observation_start_ix": [143], "located_at": [], "located_at_start_ix": [], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [144], "located_at_end_ix": []}, {"observation": "abnormalities", "observation_start_ix": [150], "located_at": ["kidneys", "tract"], "located_at_start_ix": [[154], [157]], "tags": ["definitely absent"], "suggestive_of": null, "observation_end_ix": [150], "located_at_end_ix": [[154], [157]]}]"""
    expected_text_mapping = json.loads(
        """{"139": {"user_provided_text_start": 792, "user_provided_text_end": 798}, "84": {"user_provided_text_start": 455, "user_provided_text_end": 463}, "43": {"user_provided_text_start": 228, "user_provided_text_end": 234}, "134": {"user_provided_text_start": 765, "user_provided_text_end": 772}, "52": {"user_provided_text_start": 280, "user_provided_text_end": 285}, "126": {"user_provided_text_start": 701, "user_provided_text_end": 709}, "29": {"user_provided_text_start": 161, "user_provided_text_end": 165}, "125": {"user_provided_text_start": 693, "user_provided_text_end": 700}, "121": {"user_provided_text_start": 671, "user_provided_text_end": 676}, "66": {"user_provided_text_start": 364, "user_provided_text_end": 371}, "75": {"user_provided_text_start": 413, "user_provided_text_end": 420}, "131": {"user_provided_text_start": 741, "user_provided_text_end": 755}, "34": {"user_provided_text_start": 178, "user_provided_text_end": 186}, "53": {"user_provided_text_start": 286, "user_provided_text_end": 296}, "117": {"user_provided_text_start": 651, "user_provided_text_end": 655}, "76": {"user_provided_text_start": 421, "user_provided_text_end": 428}, "71": {"user_provided_text_start": 397, "user_provided_text_end": 403}, "55": {"user_provided_text_start": 301, "user_provided_text_end": 311}, "56": {"user_provided_text_start": 312, "user_provided_text_end": 319}, "154": {"user_provided_text_start": 883, "user_provided_text_end": 890}, "150": {"user_provided_text_start": 853, "user_provided_text_end": 866}, "95": {"user_provided_text_start": 520, "user_provided_text_end": 528}, "113": {"user_provided_text_start": 625, "user_provided_text_end": 635}, "143": {"user_provided_text_start": 807, "user_provided_text_end": 816}, "144": {"user_provided_text_start": 817, "user_provided_text_end": 829}, "31": {"user_provided_text_start": 167, "user_provided_text_end": 172}, "49": {"user_provided_text_start": 268, "user_provided_text_end": 274}, "104": {"user_provided_text_start": 568, "user_provided_text_end": 575}, "27": {"user_provided_text_start": 151, "user_provided_text_end": 157}, "122": {"user_provided_text_start": 677, "user_provided_text_end": 680}, "123": {"user_provided_text_start": 680, "user_provided_text_end": 681}, "124": {"user_provided_text_start": 681, "user_provided_text_end": 692}, "68": {"user_provided_text_start": 375, "user_provided_text_end": 386}, "137": {"user_provided_text_start": 778, "user_provided_text_end": 783}, "41": {"user_provided_text_start": 212, "user_provided_text_end": 226}, "59": {"user_provided_text_start": 331, "user_provided_text_end": 337}, "81": {"user_provided_text_start": 439, "user_provided_text_end": 442}, "82": {"user_provided_text_start": 442, "user_provided_text_end": 443}, "83": {"user_provided_text_start": 443, "user_provided_text_end": 454}, "133": {"user_provided_text_start": 759, "user_provided_text_end": 764}, "46": {"user_provided_text_start": 239, "user_provided_text_end": 253}, "65": {"user_provided_text_start": 358, "user_provided_text_end": 363}, "157": {"user_provided_text_start": 902, "user_provided_text_end": 907}, "79": {"user_provided_text_start": 432, "user_provided_text_end": 437}, "111": {"user_provided_text_start": 610, "user_provided_text_end": 621}}"""
    )
    mocked_update_report_meta_data_function.assert_called_once_with(
        uid,
        report_hash,
        {
            "processed_annotations": expected_processed_annotation,
            "text_mapping": expected_text_mapping,
        },
    )
