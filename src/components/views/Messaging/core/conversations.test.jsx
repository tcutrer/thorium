import React from "react";
import {render, fireEvent, cleanup} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";
import Conversations from "./conversations";

vi.mock("react-apollo", () => ({
  Mutation: ({children}) => children(vi.fn()),
}));
vi.mock("./groupManager", () => ({default: () => null}));

afterEach(cleanup);

const simulator = {stations: [{name: "Engineering"}]};
const message = (id, sender, destination) => ({
  id,
  sender,
  destination,
  content: id,
  timestamp: new Date().toISOString(),
});
const initialMessages = [
  message("1", "Conversation 1", "Engineering"),
  message("2", "Conversation 2", "Engineering"),
];
const view = messages => (
  <Conversations messages={messages} simulator={simulator} teams={[]} />
);
const entry = (result, name) =>
  result.getByText(name, {selector: "strong"}).closest(".list-group-item");

it("does not alert on a core message when switching conversations", () => {
  const result = render(view(initialMessages));
  fireEvent.click(entry(result, "Conversation 1"));
  const messages = initialMessages.concat(
    message("3", "Conversation 1", "Engineering"),
  );
  result.rerender(view(messages));
  fireEvent.click(entry(result, "Conversation 2"));
  expect(entry(result, "Conversation 1").classList.contains("alerted")).toBe(
    false,
  );
});

it("alerts on a station reply and keeps it cleared after reading", () => {
  const result = render(view(initialMessages));
  fireEvent.click(entry(result, "Conversation 2"));
  const messages = initialMessages.concat(
    message("3", "Engineering", "Conversation 1"),
  );
  result.rerender(view(messages));
  expect(entry(result, "Conversation 1").classList.contains("alerted")).toBe(
    true,
  );
  fireEvent.click(entry(result, "Conversation 1"));
  fireEvent.click(entry(result, "Conversation 2"));
  result.rerender(view([...messages]));
  expect(entry(result, "Conversation 1").classList.contains("alerted")).toBe(
    false,
  );
});

it("does not alert on a station reply received in the selected conversation", () => {
  const result = render(view(initialMessages));
  fireEvent.click(entry(result, "Conversation 1"));
  result.rerender(
    view(initialMessages.concat(message("3", "Engineering", "Conversation 1"))),
  );
  fireEvent.click(entry(result, "Conversation 2"));
  expect(entry(result, "Conversation 1").classList.contains("alerted")).toBe(
    false,
  );
});
