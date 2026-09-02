/**
 * Isolation seam for the hospital's clinical system of record (GoTHOMIS/FHIR).
 * Only MockHospitalGateway exists until real GoTHOMIS credentials and a field
 * mapping are supplied — swap it for a GothomisGateway later without touching
 * any callers.
 */

export interface HospitalPatientRecord {
  registrationNumber: string;
  ward: string;
  /** True if GoTHOMIS has a record for this registration number. */
  found: boolean;
}

export interface QueueEntryInput {
  registrationNumber: string;
  ward: string;
  queueNumber: string;
}

export interface LabReport {
  registrationNumber: string;
  reportId: string;
  status: 'PENDING' | 'READY';
  summary?: string;
}

export interface IHospitalGateway {
  /** Look up a patient by hospital registration number at intake. */
  lookupPatient(registrationNumber: string): Promise<HospitalPatientRecord>;

  /** Write a queue entry back to GoTHOMIS. TODO(Phase 2): wire to real queue. */
  writeQueueEntry(entry: QueueEntryInput): Promise<void>;

  /** Read a lab report by registration number. TODO(Phase 3): wire to FHIR DiagnosticReport. */
  readLabReport(registrationNumber: string): Promise<LabReport | null>;
}

export const HOSPITAL_GATEWAY = Symbol('HOSPITAL_GATEWAY');
