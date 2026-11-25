import { ProtectedPhotoComponent } from '../../../shared/components/protected-photo.component';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { Job, JobPart } from '../../../core/models/job.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-update-work',
  standalone: true,
  imports: [ProtectedPhotoComponent, CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    @if (job) {
      <div class="update-work-page">
        <!-- Desktop Back Navigation -->
        <div class="page-top-nav">
          <a [routerLink]="['/technician/jobs', job.id]" class="back-link">
            <app-icon name="arrow-left" size="sm"></app-icon>
            <span>Back to Job Details</span>
          </a>
          <span class="job-id-pill">Job #{{ job.id }}</span>
        </div>

        <form [formGroup]="updateForm" (ngSubmit)="onSaveUpdate()" class="update-form-layout">
          <!-- Left Column: Work Status, Notes, Photos, Parts FormArray -->
          <div class="col-main">
            <!-- Work Status Card -->
            <div class="card status-card">
              <h3 class="card-title">Job Status & Schedule</h3>
              <div class="status-grid">
                <div class="form-group flex-1">
                  <label for="workStatusNote">Status</label>
                  <select id="workStatusNote" formControlName="workStatusNote" class="form-control">
                    <option value="Work in progress">Work in progress</option>
                    <option value="Waiting for parts">Waiting for parts</option>
                    <option value="Testing & verification">Testing & verification</option>
                    <option value="Work Completed">Work Completed</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label for="expectedCompletion">Expected Completion</label>
                  <input
                    id="expectedCompletion"
                    type="text"
                    formControlName="expectedCompletion"
                    class="form-control"
                    placeholder="e.g. Today, 4:00 PM"
                  />
                </div>
              </div>
            </div>

            <!-- Dynamic Parts FormArray -->
            <div class="card parts-card">
              <div class="card-header-row">
                <div>
                  <h3 class="card-title">Parts & Materials Used</h3>
                  <p class="card-subtitle">Add replacement parts used during repair</p>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm" (click)="addPart()">
                  <app-icon name="plus" size="sm"></app-icon>
                  <span>Add part</span>
                </button>
              </div>

              <div formArrayName="parts" class="parts-form-list">
                @for (partCtrl of partsFormArray.controls; track $index) {
                  <div [formGroupName]="$index" class="part-form-row">
                    <div class="part-field name-field">
                      <label [attr.for]="'part-name-' + $index">Part name</label>
                      <input
                        type="text"
                        formControlName="name" [id]="'part-name-' + $index"
                        class="form-control"
                        placeholder="e.g. Flexible connector hose"
                      />
                    </div>
                    <div class="part-field qty-field">
                      <label [attr.for]="'part-qty-' + $index">Quantity</label>
                      <input
                        type="number"
                        formControlName="quantity" [id]="'part-qty-' + $index"
                        class="form-control"
                        min="1"
                        (input)="recalculatePartTotal($index)"
                      />
                    </div>
                    <div class="part-field price-field">
                      <label [attr.for]="'part-price-' + $index">Price (Rs)</label>
                      <input
                        type="number"
                        formControlName="unitPrice" [id]="'part-price-' + $index"
                        class="form-control"
                        min="0"
                        (input)="recalculatePartTotal($index)"
                      />
                    </div>
                    <div class="part-field total-field">
                      <label [attr.for]="'part-total-' + $index">Total</label>
                      <span class="calculated-line-total">
                        Rs {{ partCtrl.get('total')?.value | number }}
                      </span>
                    </div>
                    <div class="part-field remove-field">
                      <button
                        type="button"
                        class="btn-remove-part"
                        (click)="removePart($index)"
                        title="Remove part"
                      >
                        <app-icon name="trash" size="sm"></app-icon>
                      </button>
                    </div>
                  </div>
                }

                @if (partsFormArray.length === 0) {
                  <div class="empty-parts-note">
                    <span>No extra parts added yet. Click "+ Add part" if materials were used.</span>
                  </div>
                }
              </div>
            </div>

            <!-- Work Notes & Photos -->
            <div class="card notes-card">
              <h3 class="card-title">Work Notes & Photos</h3>

              <div class="form-group">
                <label for="workNotes">Work description & diagnostics</label>
                <textarea
                  id="workNotes"
                  formControlName="workNotes"
                  class="form-control"
                  rows="3"
                  placeholder="Describe the repair actions taken, parts replaced and testing done..."
                ></textarea>
              </div>

              <!-- Photo Upload Section -->
              <div class="photo-upload-section">
                <strong>Work photos</strong>
                <div class="photo-badges-grid">
                  @for (photo of job.photos; track photo.id) {
                    <app-protected-photo [path]="photo.url" [label]="photo.type + ' work photo'"></app-protected-photo>
                  }
                </div>
                <label for="beforePhoto">Upload before photo</label>
                <input id="beforePhoto" type="file" accept="image/*" [disabled]="dataService.pending()" (change)="upload($event, 'before')" />
                <label for="afterPhoto">Upload after photo</label>
                <input id="afterPhoto" type="file" accept="image/*" [disabled]="dataService.pending()" (change)="upload($event, 'after')" />
              </div>
            </div>
          </div>

          <!-- Right Column: Labour & Live Auto-calculated Summary -->
          <div class="col-summary">
            <div class="card summary-sticky-card">
              <h3 class="card-title">Labour & Cost Summary</h3>

              <!-- Labour Input Fields -->
              <div class="labour-inputs">
                <div class="form-group">
                  <label for="labourHours">Labour Hours</label>
                  <input
                    id="labourHours"
                    type="number"
                    step="0.5"
                    formControlName="labourHours"
                    class="form-control"
                    (input)="recalculateAll()"
                  />
                </div>
                <div class="form-group">
                  <label for="hourlyRate">Hourly Rate (Rs)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    formControlName="hourlyRate"
                    class="form-control"
                    (input)="recalculateAll()"
                  />
                </div>
              </div>

              <!-- Live Calculation Breakdown -->
              <div class="calc-breakdown">
                <div class="breakdown-row">
                  <span>Parts Subtotal</span>
                  <span class="amount">Rs {{ calculatedPartsTotal | number }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Labour Cost ({{ updateForm.get('labourHours')?.value }}h × Rs {{ updateForm.get('hourlyRate')?.value }})</span>
                  <span class="amount">Rs {{ calculatedLabourCost | number }}</span>
                </div>
                <div class="breakdown-row total-highlight">
                  <span>Estimated Total</span>
                  <span class="grand-total">Rs {{ calculatedGrandTotal | number }}</span>
                </div>
              </div>

              @if (savedNotice) {
                <div class="save-toast">
                  <app-icon name="check" size="sm"></app-icon>
                  <span>Work update saved successfully!</span>
                </div>
              }

              <!-- Action Buttons -->
              <div class="summary-actions">
                <button type="submit" class="btn btn-secondary btn-block">
                  Save Update
                </button>
                <button
                  type="button"
                  class="btn btn-primary btn-block btn-complete"
                  (click)="onProceedToComplete()" [disabled]="dataService.pending()"
                >
                  Proceed to Complete Job
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .update-work-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;

      @include mobile {
        display: none;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-secondary);

        &:hover {
          color: var(--color-primary);
          text-decoration: none;
        }
      }

      .job-id-pill {
        font-size: 0.825rem;
        font-weight: 600;
        color: var(--color-text-muted);
        background-color: #e2e8f0;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
      }
    }

    .update-form-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;

      @include desktop {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 24px;
        align-items: start;
      }
    }

    .col-main {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .card-subtitle {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .status-grid {
      display: flex;
      gap: 16px;
      margin-top: 12px;

      @include mobile {
        flex-direction: column;
        gap: 0;
      }

      .flex-1 { flex: 1; }
    }

    /* Dynamic Parts List */
    .parts-form-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .part-form-row {
        display: flex;
        align-items: flex-end;
        gap: 10px;
        padding: 12px;
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);

        @include mobile {
          flex-wrap: wrap;
        }

        .part-field {
          display: flex;
          flex-direction: column;
          gap: 4px;

          label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--color-text-muted);
          }

          &.name-field {
            flex: 2;
            min-width: 140px;
          }

          &.qty-field {
            width: 70px;
          }

          &.price-field {
            width: 100px;
          }

          &.total-field {
            width: 90px;
            text-align: right;

            .calculated-line-total {
              height: 46px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              font-weight: 600;
              font-size: 0.9rem;
              color: var(--color-text-primary);
            }
          }

          &.remove-field {
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;

            .btn-remove-part {
              width: 36px;
              height: 36px;
              border-radius: var(--radius-sm);
              color: #dc2626;
              background-color: #fee2e2;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background-color var(--transition-fast);

              &:hover {
                background-color: #fca5a5;
              }
            }
          }
        }
      }

      .empty-parts-note {
        text-align: center;
        padding: 20px;
        font-size: 0.85rem;
        color: var(--color-text-muted);
        background-color: #f8fafc;
        border-radius: var(--radius-md);
        border: 1px dashed var(--color-border);
      }
    }

    /* Photo Upload Section */
    .photo-upload-section {
      margin-top: 16px;

      .photo-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        display: block;
        margin-bottom: 10px;
      }

      .photo-badges-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .photo-box {
          height: 72px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);

          &.uploaded {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;

            .photo-indicator {
              width: 24px;
              height: 24px;
              border-radius: var(--radius-full);
              background-color: #16a34a;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }

          &.upload-btn {
            background-color: #eff6ff;
            border: 1.5px dashed var(--color-primary);
            color: var(--color-primary);

            &:hover {
              background-color: #dbeafe;
            }
          }
        }
      }
    }

    /* Right Column: Sticky Summary */
    .col-summary {
      .summary-sticky-card {
        position: sticky;
        top: calc(#{$topbar-height} + 20px);

        .labour-inputs {
          display: flex;
          gap: 12px;
          margin: 16px 0;
        }

        .calc-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 0;
          border-top: 1px solid var(--color-border-subtle);
          border-bottom: 1px solid var(--color-border-subtle);
          margin-bottom: 20px;

          .breakdown-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: var(--color-text-secondary);

            .amount {
              font-weight: 600;
              color: var(--color-text-primary);
            }

            &.total-highlight {
              padding-top: 10px;
              margin-top: 4px;
              border-top: 1px solid var(--color-border-subtle);
              font-size: 1.15rem;
              font-weight: 700;
              color: var(--color-text-primary);

              .grand-total {
                color: var(--color-primary);
              }
            }
          }
        }

        .save-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          background-color: #dcfce7;
          color: #15803d;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .summary-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .btn-complete {
            height: 48px;
            font-size: 1rem;
          }
        }
      }
    }
  `]
})
export class UpdateWorkComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  dataService = inject(DataService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  job?: Job;
  savedNotice = false;

  calculatedPartsTotal = 0;
  calculatedLabourCost = 0;
  calculatedGrandTotal = 0;

  updateForm: FormGroup = this.fb.group({
    workStatusNote: [{ value: '', disabled: true }],
    expectedCompletion: [''],
    workNotes: [''],
    labourHours: [0, [Validators.required, Validators.min(0)]],
    hourlyRate: [{ value: 0, disabled: true }],
    parts: this.fb.array([])
  });

  get partsFormArray(): FormArray {
    return this.updateForm.get('parts') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.dataService.read(this.dataService.getJobById(id), job => {
      this.job = job;
      this.populateForm(job);
      this.changeDetector.markForCheck();
    });
    {
      this.title.setTitle(`Update Work #${id} | FixFlow`);
      this.headerService.setHeader({
        title: 'Update Work',
        showBack: true,
        backUrl: `/technician/jobs/${id}`,
        showBell: true
      });

    }
  }

  private populateForm(job: Job): void {
    this.updateForm.patchValue({
      workStatusNote: job.workStatusNote || 'Work in progress',
      expectedCompletion: job.expectedCompletion || '',
      workNotes: job.workNotes || '',
      labourHours: job.labourHours,
      hourlyRate: job.hourlyRate
    });

    this.partsFormArray.clear();
    job.parts.forEach(p => {
      this.partsFormArray.push(this.fb.group({
        id: [p.id],
        name: [p.name, Validators.required],
        quantity: [p.quantity, [Validators.required, Validators.min(1)]],
        unitPrice: [p.unitPrice, [Validators.required, Validators.min(0)]],
        total: [p.total]
      }));
    });

    this.recalculateAll();
  }

  addPart(): void {
    this.partsFormArray.push(this.fb.group({
      id: [`p-${Date.now()}`],
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      total: [0]
    }));
    this.recalculateAll();
  }

  removePart(index: number): void {
    this.partsFormArray.removeAt(index);
    this.recalculateAll();
  }

  recalculatePartTotal(index: number): void {
    const partCtrl = this.partsFormArray.at(index);
    const qty = Number(partCtrl.get('quantity')?.value) || 0;
    const price = Number(partCtrl.get('unitPrice')?.value) || 0;
    partCtrl.get('total')?.setValue(qty * price, { emitEvent: false });
    this.recalculateAll();
  }

  recalculateAll(): void {
    let partsTotal = 0;
    this.partsFormArray.controls.forEach(ctrl => {
      partsTotal += Number(ctrl.get('total')?.value) || 0;
    });

    const hours = Number(this.updateForm.get('labourHours')?.value) || 0;
    const rate = Number(this.updateForm.get('hourlyRate')?.value) || 0;
    const labourCost = hours * rate;

    this.calculatedPartsTotal = partsTotal;
    this.calculatedLabourCost = labourCost;
    this.calculatedGrandTotal = partsTotal + labourCost;
  }

  upload(event: Event, type: 'before' | 'after'): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0];
    const id = this.job?.id;
    input.value = '';
    if (image && id) {
      this.dataService.run(() => this.dataService.uploadPhoto(id, type, image), job => {
        this.job = job;
        this.changeDetector.markForCheck();
      });
    }
  }

  onSaveUpdate(proceed = false): void {
    const id = this.job?.id;
    if (!id || this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }
    const { expectedCompletion, workNotes, labourHours } = this.updateForm.getRawValue();
    const parts = (this.partsFormArray.value as JobPart[]).map(({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice }));
    this.dataService.run(() => this.dataService.updateJobWork(id, { expectedCompletion, workNotes, labourHours, parts }), job => {
      this.job = job;
      this.savedNotice = true;
      this.changeDetector.markForCheck();
      if (proceed) void this.router.navigate(['/technician/jobs', id, 'complete']);
    });
  }

  onProceedToComplete(): void {
    this.onSaveUpdate(true);
  }
}
