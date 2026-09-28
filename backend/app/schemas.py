from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


MAX_ASSISTANT_CONVERSATION_MESSAGES = 10
MAX_ASSISTANT_MESSAGE_CHARACTERS = 4000
MAX_ASSISTANT_CONVERSATION_CHARACTERS = 20000


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime


class ProjectRetrievalRequest(BaseModel):
    question: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)

    @field_validator('question')
    @classmethod
    def question_must_not_be_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Question must not be empty.')
        return value


class ProjectAskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)

    @field_validator('question')
    @classmethod
    def question_must_not_be_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Question must not be empty.')
        return value


class ProjectAssistantMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str = Field(min_length=1, max_length=MAX_ASSISTANT_MESSAGE_CHARACTERS)

    @field_validator('content')
    @classmethod
    def content_must_not_be_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Conversation message must not be empty.')
        return value


class ProjectAssistantRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    conversation: list[ProjectAssistantMessage] = Field(
        default_factory=list,
        max_length=MAX_ASSISTANT_CONVERSATION_MESSAGES,
    )

    @field_validator('question')
    @classmethod
    def question_must_not_be_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Question must not be empty.')
        return value

    @model_validator(mode='after')
    def conversation_must_fit_total_limit(self):
        total_characters = sum(len(message.content) for message in self.conversation)
        if total_characters > MAX_ASSISTANT_CONVERSATION_CHARACTERS:
            raise ValueError('Conversation exceeds the total character limit.')
        return self