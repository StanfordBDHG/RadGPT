export default function QuestionAnswer({ isSelected, question, answer, onClick }: { isSelected: boolean, question: string, answer: string, onClick: React.MouseEventHandler<HTMLParagraphElement> | undefined }) {
    return (
        <>
            <p onClick={onClick} className={(isSelected ? "font-bold" : "") + " cursor-pointer"}>
                {isSelected ? "v" : ">"}
                {" "}
                {question}
            </p>
            {isSelected && <p>{answer}</p>}
        </>
    )
}
