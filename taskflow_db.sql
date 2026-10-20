-- Adminer 6.1.2 PostgreSQL 16.15 dump

CREATE SCHEMA IF NOT EXISTS "public";
COMMENT ON SCHEMA "public" IS 'standard public schema';
SET search_path TO "public";

CREATE TABLE "BoardColumn" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "position" integer NOT NULL,
    "projectId" text NOT NULL,
    CONSTRAINT "BoardColumn_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "Comment" (
    "id" text NOT NULL,
    "content" text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "taskId" text NOT NULL,
    "authorId" text NOT NULL,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "Invitation" (
    "id" text NOT NULL,
    "email" text NOT NULL,
    "token" text NOT NULL,
    "status" "InvitationStatus" DEFAULT 'PENDING' NOT NULL,
    "expiresAt" timestamp(3) NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "organizationId" text NOT NULL,
    "role" "Role" NOT NULL,
    "invitedById" text NOT NULL,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation" USING btree (token);

CREATE UNIQUE INDEX "Invitation_email_organizationId_key" ON "Invitation" USING btree (email, "organizationId");

INSERT INTO "Invitation" ("id", "email", "token", "status", "expiresAt", "createdAt", "organizationId", "role", "invitedById") VALUES
('ddc6b89e-3187-4397-a8b3-ebd1e647b35a',	'princy@gmail.com',	'5c37238c22f5927dea8e04a405819b2e1674f55046578f88ff7d219cc164cf68',	'ACCEPTED',	'2026-10-26 11:56:01.488',	'2026-10-19 11:54:28.304',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42',	'MEMBER',	'8c6bb6a7-3e69-4fc7-a636-2f4f928671b1'),
('66e37d8c-a314-4f5e-92b0-c3fb2ecd201d',	'antsa@gmail.com',	'4d429c2788fbde93f08f88443cf9126776f1a226b2198ffbd65f8bea65dddb1b',	'PENDING',	'2026-10-27 09:21:10.883',	'2026-10-20 09:15:28.018',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42',	'MEMBER',	'8c6bb6a7-3e69-4fc7-a636-2f4f928671b1'),
('0bec8afe-9c66-4cb2-84f8-0e5b8dd3cdef',	'hasinarandria18@gmail.com',	'6ad06c3e14a209b7fcfe3a0cc74dccd316a96afee8958ab3cfbe5798aedcd616',	'PENDING',	'2026-10-27 09:24:25.61',	'2026-10-20 09:24:25.615',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42',	'MEMBER',	'8c6bb6a7-3e69-4fc7-a636-2f4f928671b1');

CREATE TABLE "Label" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "color" text NOT NULL,
    "projectId" text NOT NULL,
    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "Organization" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Organization" ("id", "name", "createdAt") VALUES
('d2b4d6c5-7ec4-47f9-a862-757de4f45a42',	'OrganizationTest',	'2026-10-19 10:09:32.815'),
('0ef56ebe-bc47-4437-a6ea-a8a6df80bd66',	'TaskDays',	'2026-10-20 09:49:08.617');

CREATE TABLE "OrganizationMember" (
    "id" text NOT NULL,
    "role" "Role" NOT NULL,
    "userId" text NOT NULL,
    "organizationId" text NOT NULL,
    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember" USING btree ("userId", "organizationId");

INSERT INTO "OrganizationMember" ("id", "role", "userId", "organizationId") VALUES
('9584eac0-5c09-4940-aa2c-0c930890bacb',	'OWNER',	'8c6bb6a7-3e69-4fc7-a636-2f4f928671b1',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42'),
('',	'MEMBER',	'd1466c12-2ab0-4794-8385-e0e50c59d88d',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42'),
('d8ad97a0-0ae8-4173-a36a-957f7aed82db',	'MEMBER',	'e815c202-d5b0-4709-b5c2-2426f75d2d43',	'd2b4d6c5-7ec4-47f9-a862-757de4f45a42'),
('510cd471-64c7-4e70-857a-42148eac10f6',	'OWNER',	'e815c202-d5b0-4709-b5c2-2426f75d2d43',	'0ef56ebe-bc47-4437-a6ea-a8a6df80bd66');

CREATE TABLE "Project" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "organizationId" text NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "Task" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "dueDate" timestamp(3),
    "position" integer NOT NULL,
    "boardColumnId" text NOT NULL,
    "assigneeId" text,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "TaskLabel" (
    "taskId" text NOT NULL,
    "labelId" text NOT NULL,
    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("taskId", "labelId")
);


CREATE TABLE "User" (
    "id" text NOT NULL,
    "email" text NOT NULL,
    "passwordHash" text NOT NULL,
    "name" text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree (email);

INSERT INTO "User" ("id", "email", "passwordHash", "name", "createdAt") VALUES
('d1466c12-2ab0-4794-8385-e0e50c59d88d',	'test@gmail.com',	'$2b$10$x0JnPijLD/S8C7Fd1VoHv.KHeQINf9YCRWulJIcU5UvVJyyxeRJie',	'Test',	'2026-10-19 06:35:46.897'),
('8c6bb6a7-3e69-4fc7-a636-2f4f928671b1',	'hasina@gmail.com',	'$2b$10$hCMid0TtFSumK2LVV2hPceKIaUP.6/osD3tI.qZ.lPWOBxgATdV.O',	'Hasina',	'2026-10-19 06:51:58.105'),
('e815c202-d5b0-4709-b5c2-2426f75d2d43',	'princy@gmail.com',	'$2b$10$cSAYhMfOGAivA1h51uIyB.jc.54cFBZy1fp8/dlTKwy7Pc45cRhKy',	'Princy',	'2026-10-19 10:37:46.013'),
('2972eb42-21ad-4987-a392-7c203ca43f5f',	'antsa@gmail.com',	'$2b$10$k6hUgyxrNrsibM6sWkJXUOdo224fbCo9y6UiNREM1Vut/mq0.drBi',	'Antsa',	'2026-10-20 09:14:37.401');

ALTER TABLE ONLY "BoardColumn" ADD CONSTRAINT "BoardColumn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "Label" ADD CONSTRAINT "Label_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY "Task" ADD CONSTRAINT "Task_boardColumnId_fkey" FOREIGN KEY ("boardColumnId") REFERENCES "BoardColumn"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY "TaskLabel" ADD CONSTRAINT "TaskLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "TaskLabel" ADD CONSTRAINT "TaskLabel_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 2026-10-20 10:03:50 UTC
