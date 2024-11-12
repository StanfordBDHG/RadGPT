def add_end_ix_to_processed_annotations(processed_annotations, radgraph_output):
    def get_end_ix_for_start_ix(start_idx):
        ents = radgraph_output["radgraph_annotations"]["0"]["entities"]
        for e in ents:
            if ents[e]["start_ix"] == start_idx:
                return ents[e]["end_ix"]
        return None

    for processed_annotation in processed_annotations:
        located_at_start_observations = processed_annotation["located_at_start_ix"]
        located_at_end_observations = []
        for located_at_start_observation in located_at_start_observations:
            end_indices = []
            for start_idx in located_at_start_observation:
                end_indices.append(get_end_ix_for_start_ix(start_idx))
            located_at_end_observations.append(end_indices)
        processed_annotation["located_at_end_ix"] = located_at_end_observations
        print(processed_annotation)

    return processed_annotations


def determine_entities_in_user_entered_text(user_entered_text, radgraph_output):
    processed_annotations = add_end_ix_to_processed_annotations(
        radgraph_output["processed_annotations"], radgraph_output
    )

    radgraph_text = radgraph_output["radgraph_text"]
    tokens = radgraph_text.split(" ")

    def flat(x):
        return [item for row in x for item in row]

    observations = [
        (start_idx, end_idx)
        for processed_annotation in processed_annotations
        for start_idx, end_idx in zip(
            processed_annotation["observation_start_ix"],
            processed_annotation["observation_end_ix"],
        )
    ]

    relations = [
        (start_idx, end_idx)
        for processed_annotation in processed_annotations
        for start_idx, end_idx in zip(
            flat(processed_annotation["located_at_start_ix"]),
            flat(processed_annotation["located_at_end_ix"]),
        )
    ]

    def find_range_in_real_text():
        return_dict = {}

        text_pointer = 0
        for idx, token in enumerate(tokens):
            while text_pointer < len(user_entered_text):
                temp_text_pointer = 0
                while (
                    temp_text_pointer < len(token)
                    and temp_text_pointer + text_pointer < len(user_entered_text)
                    and token[temp_text_pointer]
                    == user_entered_text[text_pointer + temp_text_pointer]
                ):
                    temp_text_pointer += 1

                if temp_text_pointer >= len(token):
                    return_dict[idx] = (
                        text_pointer,
                        text_pointer + temp_text_pointer,
                        token,
                    )

                    text_pointer += temp_text_pointer
                    break
                text_pointer += 1
        return return_dict

    def find_observations(observations):
        index_dict = find_range_in_real_text()
        return_dict = {}
        for f, t in observations:
            # obj = index_dict[f]
            # for idx in range(f + 1, t + 1):
            #     _, ne_end, ne_name = index_dict[idx]
            #     obj = (obj[0], ne_end, obj[2] + ne_name)
            for index in range(f, t + 1):
                start_idx, end_idx, _ = index_dict[index]
                return_dict[index] = {
                    "user_entered_text_start": start_idx,
                    "user_entered_text_end": end_idx,
                }
        return return_dict

    # Removing duplicates
    total_entities = list(set(observations + relations))

    final_entities_in_text = find_observations(total_entities)
    # return sorted(final_entities_in_text)
    return final_entities_in_text


# Example Usage
# user_entered_text = "There is evidence of a right lower lobe consolidation with air bronchograms, consistent with pneumonia. Mild pleural effusion is noted on the right side. No pneumothorax is seen. Diffuse interstitial markings are slightly increased, suggestive of early interstitial lung disease."

# radgraph = RadGraph()
# annotations = radgraph([user_entered_text])
# json_report = get_radgraph_processed_annotations(annotations)

# entities = determine_entities_in_user_entered_text(user_entered_text, json_report)
