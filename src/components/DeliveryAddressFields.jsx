import { AddressPicker } from './AddressPicker.jsx'

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm text-text-muted">{label}</label>
    {children}
  </div>
)

const inputClass =
  'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-text placeholder:text-text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

// The "enter a delivery address" block — AddressPicker (or a plain manual
// fallback when Google Maps hasn't loaded) plus apartment/entrance/floor
// and the private-house toggle. Shared between CheckoutPage's delivery
// branch and ProfileModal's "add a saved address" form so the two don't
// drift out of sync with each other.
export const DeliveryAddressFields = ({ city, mapsLoaded, value, onChange }) => {
  const handleChange = (e) => {
    const { name, type, checked, value: fieldValue } = e.target
    onChange({ [name]: type === 'checkbox' ? checked : fieldValue })
  }

  return (
    <>
      {mapsLoaded ? (
        <AddressPicker
          city={city}
          value={{
            street: value.street,
            building: value.building,
            lat: value.deliveryLat,
            lng: value.deliveryLng,
            formattedAddress: value.formattedAddress,
          }}
          onChange={({ street, building, lat, lng, formattedAddress }) =>
            onChange({ street, building, deliveryLat: lat, deliveryLng: lng, formattedAddress })
          }
        />
      ) : (
        // Карта недоступна (не завантажилась) — даємо ввести адресу вручну.
        <>
          <Field label="Вулиця">
            <input
              name="street"
              value={value.street}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Будинок">
            <input
              name="building"
              value={value.building}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
        </>
      )}

      {!value.isPrivateHouse && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Field label="Квартира">
            <input
              name="apartment"
              value={value.apartment}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Під'їзд">
            <input
              name="entrance"
              value={value.entrance}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Поверх">
            <input
              name="floor"
              value={value.floor}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          name="isPrivateHouse"
          checked={value.isPrivateHouse}
          onChange={handleChange}
          className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
        />
        Приватний будинок
      </label>
    </>
  )
}
