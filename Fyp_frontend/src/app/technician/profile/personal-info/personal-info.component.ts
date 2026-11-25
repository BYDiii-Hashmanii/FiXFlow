import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="personal-info-page">
      <div class="page-top-nav">
        <a routerLink="/technician/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Back to Profile</span>
        </a>
      </div>

      <div class="info-card-container">
        <!-- Personal Information Card (matches Screen 26 in PDF) -->
        <div class="info-card card">
          <h1 class="card-title">Personal Information</h1>
          <p class="card-subtitle">Manage your contact details and active service territory</p>

          <form [formGroup]="infoForm" (ngSubmit)="onSubmit()" class="info-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                formControlName="phone"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="serviceArea">Service Area</label>
              <input
                id="serviceArea"
                type="text"
                formControlName="serviceArea"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="company">Company</label>
              <input
                id="company"
                type="text"
                [value]="dataService.technician()?.company"
                class="form-control"
                readonly
              />
            </div>


            <div class="info-note">
              <app-icon name="alert-circle" size="sm"></app-icon>
              <span>To update your registered company name or CNIC details, please contact your service administrator.</span>
            </div>

            @if (saved) {
              <div class="save-toast">
                <app-icon name="check" size="sm"></app-icon>
                <span>Information updated successfully!</span>
              </div>
            }

            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block btn-save" [disabled]="infoForm.invalid">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .personal-info-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-top-nav {
      display: flex;
      align-items: center;

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
    }

    .info-card-container {
      display: flex;
      justify-content: center;
    }

    /* Personal Info Card matches Screen 26 in PDF */
    .info-card {
      width: 100%;
      max-width: $form-max-width;
      padding: 32px 28px;

      @include mobile {
        padding: 20px 16px;
      }

      .card-title {
        font-size: 1.35rem;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .card-subtitle {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-bottom: 24px;
      }

      .info-note {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        border-radius: var(--radius-md);
        background-color: #f8fafc;
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        font-size: 0.825rem;
        line-height: 1.5;
        margin-bottom: 20px;
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
        margin-bottom: 20px;
      }

      .form-actions {
        margin-top: 8px;

        .btn-save {
          height: 48px;
          font-size: 1rem;
        }
      }
    }
  `]
})
export class PersonalInfoComponent implements OnInit {
  private fb = inject(FormBuilder);
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  saved = false;

  infoForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.email],
    serviceArea: ['']
  });

  ngOnInit(): void {
    this.title.setTitle('Personal Information | FixFlow');
    this.headerService.setHeader({
      title: 'Personal Information',
      showBack: true,
      backUrl: '/technician/profile',
      showBell: true
    });

    this.dataService.loadProfile(tech => {
      this.infoForm.patchValue({ name: tech.name, phone: tech.phone, email: tech.email, serviceArea: tech.serviceArea });
    });
  }

  onSubmit(): void {
    if (this.infoForm.valid) {
      const { name, phone, email, serviceArea } = this.infoForm.value;
      this.dataService.updateProfile({ fullName: name, phone, email: email || null, address: serviceArea }, () => { this.saved = true; });
    }
  }
}
